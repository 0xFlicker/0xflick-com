import {
  APIEmbed,
  APIEmbedField,
  InteractionType,
} from "discord-api-types/v10";
import {
  fameLadySocietyABI,
  fameLadySocietyAddress,
  fameLadySquadAddress,
} from "../../../lambda/fls-wrapper-event/generated.js";
import {
  customDescription,
  fetchMetadata,
} from "../../../lambda/fls-wrapper-event/metadata.js";
import { mainnetClient } from "../../../lambda/fls-wrapper-event/viem.js";
import { register as deferredRegister } from "../../update-interaction/commands.js";
import { getOptions, logger } from "./common.js";

deferredRegister({
  handler: async (interaction) => {
    if (interaction.data.name !== "fls") {
      return false;
    }

    try {
      logger.info("responding to fls");
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
      const { tokenId: tokenIdNum } = getOptions(interaction.data.options);
      const tokenId = BigInt(tokenIdNum);
      const [address, metadata] = await Promise.all([
        mainnetClient.readContract({
          address: fameLadySocietyAddress[1],
          abi: fameLadySocietyABI,
          functionName: "ownerOf",
          args: [tokenId],
        }),
        fetchMetadata({
          client: mainnetClient,
          address: fameLadySocietyAddress[1],
          tokenId: tokenId,
        }),
      ]);
      const ensName = await mainnetClient.getEnsName({ address });
      const displayName = ensName ? ensName : address;
      const description = customDescription(metadata);
      const fields: APIEmbedField[] = [
        {
          name: "name",
          value: metadata.name,
          inline: true,
        },
        {
          name: "token id",
          value: tokenId.toString(),
          inline: true,
        },
        {
          name: "by",
          value: displayName,
          inline: true,
        },
      ];
      const embeds: APIEmbed[] = [
        {
          title: "Flaunt!",
          description,
          fields,
          url: `https://www.fameladysociety.com/mainnet/token/${tokenId}`,
          image: {
            url: `https://www.fameladysociety.com/mainnet/og/token/${tokenId}`,
          },
        },
      ];

      return {
        embeds,
      };
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: InteractionType.MessageComponent,
          data: {
            content: `Error: ${error.message}`,
          },
        }),
      };
    }
  },
});
