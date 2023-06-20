import { createDb, MetadataJobDAO, createLogger } from "@0xflick/backend";
import {
  EMetadataFetchEventDetailType,
  IMetadataFetchEventDetailProgress,
} from "@0xflick/models";
import { SQSHandler } from "aws-lambda";
import { emitMetadataEvent } from "../esb/emit";

const logger = createLogger({
  name: "lambda/metadata/fetchProgress",
});

const db = createDb({
  region: process.env.DYNAMODB_REGION,
});

MetadataJobDAO.TABLE_NAME = process.env.METADATA_JOB_TABLE_NAME;

const metadataDao = new MetadataJobDAO(db);

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const { body } = record;
      const { Message: message } = JSON.parse(body);
      const payload = JSON.parse(
        message.data
      ) as IMetadataFetchEventDetailProgress;
      const { jobId, successTokenIds, failedTokenIds } = payload;

      const job = await metadataDao.writeChunkProgress({
        jobId,
        countSuccess: successTokenIds.length,
        countFailed: failedTokenIds.length,
      });

      logger.info(
        `Updated job ${jobId} with total ${job.total} progress to ${job.totalSuccess} success and ${job.totalFailed} failed`
      );

      if (failedTokenIds.length > 0) {
        logger.info(`Job ${jobId} has failed tokens`);
        await emitMetadataEvent(
          {
            DetailType: EMetadataFetchEventDetailType.FAILED,
            Detail: {
              jobId,
              tokenIds: failedTokenIds,
            },
          },
          "lambda"
        );
      }

      if (job.total <= job.totalSuccess + job.totalFailed) {
        logger.info(`Job ${jobId} is complete`);
        await emitMetadataEvent(
          {
            DetailType: EMetadataFetchEventDetailType.COMPLETE,
            Detail: {
              jobId,
            },
          },
          "lambda"
        );
      }
    } catch (error) {
      logger.error(error, "Failed to process message");
    }
  }
};
