import { APIGatewayProxyResult } from "aws-lambda";
import { InferredApplicationCommandType } from "../types.js";
import { createLogger } from "@0xflick/backend";

interface ICommandHandler {
  handler(
    event: InferredApplicationCommandType
  ): Promise<false | APIGatewayProxyResult>;
}

const handlers: ICommandHandler[] = [];
const logger = createLogger({
  name: "discord/update-interaction/commands",
});

export function register(handler: ICommandHandler): void {
  handlers.push(handler);
}

export async function handle(
  interaction: InferredApplicationCommandType
): Promise<APIGatewayProxyResult> {
  for (const handler of handlers) {
    const result = await handler.handler(interaction);
    if (result) {
      logger.info("Handled interaction");
      return result;
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "unknown command" }),
  };
}
