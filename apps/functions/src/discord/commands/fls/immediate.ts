import { InteractionType } from "discord-api-types/v10";
import { register } from "../../interactions/command";
import {
  createDeferredInteraction,
  deferredMessage,
} from "../../update-interaction";
import { getOptions, logger } from "./common";

register({
  handler: async (interaction) => {
    if (interaction.data.name !== "fls") {
      return false;
    }

    logger.info("creating deferred fls");
    if ("options" in interaction.data === false) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: InteractionType.MessageComponent,
          data: {
            content: "Missing options",
          },
        }),
      };
    }
    try {
      getOptions(interaction.data.options);
    } catch (error: any) {
      logger.error(`Invalid option: ${error.message}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: InteractionType.MessageComponent,
          data: {
            content: `Invalid option: ${error.message}`,
          },
        }),
      };
    }
    const messageId = await createDeferredInteraction(interaction);
    logger.info(`Created deferred interaction ${messageId} and acknowledging`);
    return {
      statusCode: 200,
      body: JSON.stringify(deferredMessage()),
    };
  },
});
