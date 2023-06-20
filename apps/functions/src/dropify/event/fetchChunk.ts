import { SQSHandler } from "aws-lambda";
import {
  EMetadataFetchEventDetailType,
  IMetadataFetchEventDetailProcessChunk,
  IMetadata,
  EMetadataJobStatus,
} from "@0xflick/models";
import { createDb, createLogger, MetadataJobDAO } from "@0xflick/backend";
import { emitMetadataEvent } from "../esb/emit";
import { mergeMap, range, toArray, lastValueFrom } from "rxjs";
import { providerForChain } from "../utils/provider";
import { Contract } from "ethers";
import { retryWithBackOff } from "../utils/retry";
import { createIpfsClient, loadIpfsContent } from "../utils/ipfs";
import { INormalizedAttribute, normalizeAttributes } from "../utils/normalize";
import { S3 } from "@aws-sdk/client-s3";

const logger = createLogger({
  name: "dropify/event/fetchStart",
});

const s3 = new S3({
  region: process.env.AWS_REGION,
});

const db = createDb({
  region: process.env.DYNAMODB_REGION,
});

MetadataJobDAO.TABLE_NAME = process.env.METADATA_JOB_TABLE_NAME;

const metadataDao = new MetadataJobDAO(db);

export async function getJobStatus(jobId: string) {
  const job = await metadataDao.get(jobId);
  return job.status;
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const { body } = record;
      const { Message: message } = JSON.parse(body);
      const payload = JSON.parse(
        message.data
      ) as IMetadataFetchEventDetailProcessChunk;
      const status = await getJobStatus(payload.jobId);
      if (status === EMetadataJobStatus.STOPPED) {
        logger.info(`Job ${payload.jobId} is stopped`);
        continue;
      }
      try {
        const provider = providerForChain(payload.chainId);
        const tokenURIContract = new Contract(payload.contractAddress, [
          {
            name: "tokenURI",
            outputs: [{ type: "string" }],
            inputs: [{ type: "uint256", name: "tokenId" }],
          },
        ]).connect(provider);
        const ipfsClient = createIpfsClient();
        const normalizedAttributes = await lastValueFrom(
          range(0, payload.tokenIds.length - 1).pipe(
            mergeMap(async (index) => {
              try {
                const tokenId = payload.tokenIds[index];
                const tokenURI = await tokenURIContract.tokenURI(tokenId);
                const tokenURL = new URL(tokenURI);
                let content: string;
                if (tokenURL.protocol === "ipfs:") {
                  const ipfsHash = tokenURI.slice(7);
                  content = (
                    await retryWithBackOff(
                      () => loadIpfsContent(ipfsClient, ipfsHash),
                      10,
                      250
                    )
                  ).toString();
                } else {
                  const response = await fetch(tokenURL);
                  content = await response.text();
                }
                const metadata = JSON.parse(content) as IMetadata;
                const normalizedAttributes = normalizeAttributes(
                  tokenId.toString(),
                  payload.contractAddress,
                  metadata.attributes
                );
                return {
                  status: "success",
                  normalizedAttributes,
                } as const;
              } catch (error) {
                logger.error(error, "Failed to process message");
                return {
                  status: "failed",
                  tokenId: payload.tokenIds[index],
                } as const;
              }
            }),
            toArray()
          )
        );
        const [successAttributes, failedAttributes] = normalizedAttributes
          .flat()
          .reduce(
            ([success, failed], item) => {
              if (item.status === "success") {
                success.push(...item.normalizedAttributes);
              } else {
                failed.push(item.tokenId);
              }
              return [success, failed];
            },
            [[], []] as [INormalizedAttribute[], string[]]
          );
        const key = `${payload.chainId}/${payload.contractAddress}/${payload.tokenIds[0]}`;
        await s3.putObject({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: JSON.stringify(successAttributes),
        });
        const uniqueSuccessTokenIds = Array.from(
          new Set(successAttributes.map((attribute) => attribute.tokenId))
        );
        await emitMetadataEvent(
          {
            DetailType: EMetadataFetchEventDetailType.PROGRESS,
            Detail: {
              jobId: payload.jobId,
              successTokenIds: uniqueSuccessTokenIds,
              failedTokenIds: failedAttributes,
            },
          },
          "lambda"
        );
      } catch (error) {
        logger.error(error, "Failed to process message");
        throw error;
      }
    } catch (error) {
      logger.error(error, "Failed to process record");
      throw error;
    }
  }
};
