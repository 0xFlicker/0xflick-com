import { createLogger } from "@0xflick/backend";
import {
  APIApplicationCommandInteractionDataOption,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
export const logger = createLogger({
  name: "discord/commands/fls/common",
}).child({
  command: "fls",
});

export class OptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OptionsError";
  }
}

export interface IFlauntOptions {
  type: "flaunt";
  tokenId: number;
}

export function getOptions(
  options?: APIApplicationCommandInteractionDataOption[]
) {
  const partialOptions: Partial<IFlauntOptions> = {};
  if (!options) {
    throw new OptionsError("Missing options");
  }
  for (const option of options) {
    if (
      option.type === ApplicationCommandOptionType.Subcommand &&
      option.name === "flaunt"
    ) {
      for (const subOptions of option.options) {
        if ("value" in subOptions) {
          switch (subOptions.name) {
            case "token": {
              const num = Number(subOptions.value);
              if (Number.isNaN(num)) {
                throw new OptionsError("Token must be a number");
              }
              partialOptions.tokenId = num;
              break;
            }
          }
        }
      }
      return partialOptions;
    }
  }
  throw new OptionsError("Missing subcommand group");
}
