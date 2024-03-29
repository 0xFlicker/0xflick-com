import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { sign } from "tweetnacl";
import { createLogger } from "@0xflick/backend";
import { InferredApplicationCommandType } from "../types.js";
import { handle as pingHandler } from "../interactions/ping.js";
import { handle as commandHandler } from "../interactions/command.js";
import type { APIInteraction } from "discord-api-types/v10";
import { InteractionType } from "discord-api-types/v10";
import "../commands/immediate.js";
import { publicKey } from "../config.js";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const logger = createLogger({
  name: "discord/lambda/discord",
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    logger.info({ event }, "Received event");
    const PUBLIC_KEY = publicKey.get();
    if (!PUBLIC_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "PUBLIC_KEY is not set",
        }),
      };
    }

    if (!event.headers) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "headers is not set",
        }),
      };
    }
    const signature = event.headers["x-signature-ed25519"];
    const timestamp = event.headers["x-signature-timestamp"];

    if (!signature || !timestamp) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "signature or timestamp is not set",
        }),
      };
    }

    const strBody = event.body;
    if (!strBody) {
      throw new Error("Body is not set");
    }

    const isVerified = sign.detached.verify(
      Buffer.from(timestamp + strBody),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );

    if (!isVerified) {
      return {
        statusCode: 401,
        body: JSON.stringify("invalid request signature"),
      };
    }

    const body: APIInteraction = JSON.parse(strBody);
    logger.debug({ body }, "body");

    switch (body.type) {
      case InteractionType.Ping:
        return pingHandler(body);
      case InteractionType.ApplicationCommand:
        return commandHandler(body as InferredApplicationCommandType);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "unknown interaction type",
          }),
        };
    }
  } catch (e: any) {
    logger.error({
      err: e,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
};
