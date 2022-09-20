import axios, { AxiosError } from "axios";
import { createLogger } from "@0xflick/backend";
import {
  APIInteractionResponseCallbackData,
  RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import { discordBotToken } from "../config";

const logger = createLogger({ name: "discord/service" });

export function getApplicationId() {
  if (!process.env.DISCORD_APPLICATION_ID) {
    logger.error("DISCORD_APPLICATION_ID not set");
    throw new Error("DISCORD_APPLICATION_ID not set");
  }
  return process.env.DISCORD_APPLICATION_ID;
}

export async function sendInteraction(
  token: string,
  data: APIInteractionResponseCallbackData
) {
  try {
    const response = await axios.patch(
      `https://discord.com/api/v10/webhooks/${getApplicationId()}/${token}/messages/@original`,
      data
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.data) {
      logger.error({ err: error }, "Error sending interaction");
    }
    throw error;
  }
}

export async function sendChannelMessage(
  channelId: string,
  message: RESTPostAPIChannelMessageJSONBody
) {
  try {
    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      message,
      {
        headers: {
          Authorization: `Bot ${discordBotToken.get()}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError && error.response?.data) {
      logger.error({ err: error }, "Error sending channel message");
    }
    throw error;
  }
}
