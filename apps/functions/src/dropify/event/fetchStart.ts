import { SQSHandler } from "aws-lambda";
import {
  EMetadataFetchEventDetailType,
  IMetadataFetchEventDetailStart,
} from "@0xflick/models";
import { createLogger } from "@0xflick/backend";
import { batchEvents } from "../utils/batch";
import { emitMetadataEvent } from "../esb/emit";

const logger = createLogger({
  name: "dropify/event/fetchStart",
});

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const { body } = record;
      const { Message: message } = JSON.parse(body);
      const payload = JSON.parse(
        message.data
      ) as IMetadataFetchEventDetailStart;
      logger.debug({ payload }, "Received deferred interaction");

      // create batched events
      const events = batchEvents(payload, 10);
      await Promise.all(
        events.map((event) =>
          emitMetadataEvent(
            {
              DetailType: EMetadataFetchEventDetailType.PROCESS_CHUNK,
              Detail: event,
            },
            "lambda"
          )
        )
      );
      logger.debug({ events }, "Created batched events");
    } catch (error) {
      logger.error(error, "Failed to process message");
    }
  }
};
