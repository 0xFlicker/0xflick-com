import { IMetadataFetchEvent } from "@0xflick/models";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { createLogger } from "@0xflick/backend";

const logger = createLogger({
  name: "lambda/esb/emit",
});
const eventBridge = new EventBridgeClient({
  region: process.env.NFTMETADATA_EVENT_REGION,
});

export async function emitMetadataEvent(
  event: IMetadataFetchEvent,
  source: string
) {
  if (!process.env.NFTMETADATA_EVENT_BUS_NAME) {
    throw new Error("NFTMETADATA_EVENT_BUS_NAME is not defined");
  }
  try {
    // Emit the event
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: process.env.NFTMETADATA_EVENT_BUS_NAME,
          Source: source,
          DetailType: event.DetailType,
          Detail: JSON.stringify(event.Detail),
        },
      ],
    });
    logger.info(
      `Sending event ${event.DetailType} to EventBridge for job ${event.Detail.jobId}`
    );
    const response = await eventBridge.send(command);
    logger.info(
      `Event ${event.DetailType} sent to EventBridge for job ${
        event.Detail.jobId
      }: ${response.Entries.map((e) => e.EventId).join(", ")}`
    );
    return response;
  } catch (error) {
    logger.error(
      error,
      `Failed to send event ${event.DetailType} to EventBridge for job ${event.Detail.jobId}`
    );
    throw error;
  }
}
