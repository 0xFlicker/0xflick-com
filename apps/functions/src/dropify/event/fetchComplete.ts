import { createDb, MetadataJobDAO, createLogger } from "@0xflick/backend";
import {
  EMetadataJobStatus,
  IMetadataFetchEventDetailComplete,
} from "@0xflick/models";
import { SQSHandler } from "aws-lambda";

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
      ) as IMetadataFetchEventDetailComplete;
      const { jobId } = payload;

      await metadataDao.updateStatus(jobId, EMetadataJobStatus.COMPLETE);
      logger.info(`Updated job ${jobId} to complete`);
    } catch (error) {
      logger.error(error, "Failed to process message");
    }
  }
};
