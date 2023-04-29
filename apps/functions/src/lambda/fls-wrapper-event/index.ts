// import { EventBridgeEvent } from "aws-lambda";
import { constants, providers } from "ethers";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { utils } from "ethers";
import {
  wrappedNftABI,
  wrappedNftAddress,
  fameLadySocietyABI,
  fameLadySocietyAddress,
} from "./generated";
import { SNS } from "@aws-sdk/client-sns";
import { APIEmbedField } from "discord-api-types/v10";
import { sendDiscordMessage } from "@0xflick/backend/discord/send";
import { createLogger } from "@0xflick/backend";

const logger = createLogger({
  name: "fls-wrapper-event",
});

interface Event {
  blockNumber: number;
  eventFragment: utils.EventFragment;
  name: string;
  signature: string;
  topic: string;
  args: utils.Result;
}
const { Interface } = utils;

if (!process.env.RPC_URL_MAINNET) {
  throw new Error("RPC_URL_MAINNET not set");
}

if (!process.env.RPC_URL_GOERLI) {
  throw new Error("RPC_URL_GOERLI not set");
}

if (!process.env.DYNAMODB_REGION) {
  throw new Error("DYNAMODB_REGION not set");
}

if (!process.env.DYNAMODB_TABLE) {
  throw new Error("DYNAMODB_TABLE not set");
}

if (!process.env.DISCORD_MESSAGE_TOPIC_ARN) {
  throw new Error("DISCORD_MESSAGE_TOPIC_ARN not set");
}

if (!process.env.DISCORD_CHANNEL_ID) {
  throw new Error("DISCORD_CHANNEL_ID not set");
}

const mainnetProvider = new providers.JsonRpcProvider(
  process.env.RPC_URL_MAINNET,
  1
);

const goerliProvider = new providers.JsonRpcProvider(
  process.env.RPC_URL_GOERLI,
  5
);

const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.DYNAMODB_REGION,
  }),
  {
    marshallOptions: {
      convertEmptyValues: true,
    },
  }
);

async function findEvents(
  provider: providers.JsonRpcProvider,
  contractAddress: string,
  contractInterface: utils.Interface,
  fromBlock: number,
  toBlock: number
): Promise<Event[]> {
  const events = await provider.getLogs({
    address: contractAddress,
    fromBlock,
    toBlock,
    topics: [contractInterface.getEventTopic("Transfer")],
  });
  // Only interested in events that have from address 0x0 (new mints)
  const filteredEvents = events.filter((event) => {
    const parsedEvent = contractInterface.parseLog(event);
    return parsedEvent.args[0] === constants.AddressZero;
  });
  const ret = filteredEvents.map((event) => {
    const parsedEvent = contractInterface.parseLog(event);
    return {
      ...parsedEvent,
      blockNumber: event.blockNumber,
    };
  });
  logger.info(`Found ${ret.length} events`);
  return ret;
}

async function notifyDiscordSingleToken({
  tokenId,
  toAddress,
  channelId,
  provider,
  testnet,
  discordMessageTopicArn,
  sns,
}: {
  tokenId: string;
  toAddress: string;
  channelId: string;
  provider: providers.Provider;
  testnet: boolean;
  discordMessageTopicArn: string;
  sns: SNS;
}) {
  const ensName = await provider.lookupAddress(toAddress);
  const displayName = ensName ? ensName : toAddress;
  const fields: APIEmbedField[] = [];
  fields.push({
    name: "token id",
    value: tokenId,
    inline: true,
  });
  fields.push({
    name: "by",
    value: displayName,
    inline: true,
  });
  if (testnet) {
    fields.push({
      name: "goerli",
      value: "true",
      inline: true,
    });
  }

  await sendDiscordMessage({
    channelId,
    message: {
      embeds: [
        {
          title: "#itsawrap",
          description: `A new Fame Lady Society was wrapped${
            testnet ? " on Goerli" : ""
          }`,
          image: {
            url: `https://img.fameladysociety.com/thumb/${tokenId}`,
          },
          fields,
        },
      ],
    },
    topicArn: discordMessageTopicArn,
    sns,
  });
}

async function notifyDiscordMultipleTokens({
  tokenIds,
  toAddress,
  channelId,
  provider,
  testnet,
  discordMessageTopicArn,
  sns,
}: {
  tokenIds: string[];
  toAddress: string;
  channelId: string;
  provider: providers.Provider;
  testnet: boolean;
  discordMessageTopicArn: string;
  sns: SNS;
}) {
  let ensName: string;
  try {
    ensName = await provider.lookupAddress(toAddress);
  } catch (e) {
    logger.error(e, "Failed to lookup address", toAddress);
    ensName = toAddress;
  }
  const displayName = ensName ? ensName : toAddress;
  const fields: APIEmbedField[] = [];
  fields.push({
    name: "total wrapped",
    value: tokenIds.length.toString(),
    inline: true,
  });
  fields.push({
    name: "by",
    value: displayName,
    inline: true,
  });
  if (testnet) {
    fields.push({
      name: "goerli",
      value: "true",
      inline: true,
    });
  }

  await sendDiscordMessage({
    channelId,
    message: {
      embeds: [
        {
          title: "#itsawrap",
          description: `Fame Lady Society were wrapped${
            testnet ? " on Goerli" : ""
          }`,
          image: {
            url: `https://img.fameladysociety.com/mosaic/${tokenIds.join(",")}`,
          },
          fields,
        },
      ],
    },
    topicArn: discordMessageTopicArn,
    sns,
  });
}

export const handler = async () =>
  // event: EventBridgeEvent<"check-fls-wrap", void>
  {
    const wrappedNftInterface = new Interface(wrappedNftABI);
    const fameLadySocietyInterface = new Interface(fameLadySocietyABI);
    // Get last bock read
    const [lastBlockGoerliResponse, lastBlockMainnetResponse] =
      await Promise.all([
        db.send(
          new GetCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
              key: "lastBlockGoerli",
            },
          })
        ),
        db.send(
          new GetCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
              key: "lastBlockMainnet",
            },
          })
        ),
      ]);

    const [latestBlockGoerli, latestBlockMainnet] = await Promise.all([
      goerliProvider.getBlockNumber(),
      mainnetProvider.getBlockNumber(),
    ]);

    const lastBlockGoerli: number =
      lastBlockGoerliResponse.Item?.value ?? latestBlockGoerli;
    const lastBlockMainnet: number =
      lastBlockMainnetResponse.Item?.value ?? latestBlockMainnet;

    // Get events from last block read
    const [goerliEvents, mainnetEvents] = await Promise.all([
      findEvents(
        goerliProvider,
        wrappedNftAddress[5],
        wrappedNftInterface,
        lastBlockGoerli,
        latestBlockGoerli
      ),
      findEvents(
        mainnetProvider,
        fameLadySocietyAddress[1],
        fameLadySocietyInterface,
        lastBlockMainnet,
        latestBlockMainnet
      ),
    ]);

    // Notify discord
    const sns = new SNS({});
    // Group events by to address
    const goerliEventsByTo = new Map<string, Event[]>();
    const mainnetEventsByTo = new Map<string, Event[]>();
    for (const event of goerliEvents) {
      const events: Event[] = goerliEventsByTo.get(event.args[1]) || [];
      events.push(event);
      goerliEventsByTo.set(event.args[1], events);
    }
    for (const event of mainnetEvents) {
      const events: Event[] = mainnetEventsByTo.get(event.args[1]) || [];
      events.push(event);
      mainnetEventsByTo.set(event.args[1], events);
    }

    // Now push out the events
    for (const [to, events] of goerliEventsByTo.entries()) {
      const tokenIds = events.map(({ args }) => args[2].toString());
      if (tokenIds.length === 1) {
        await notifyDiscordSingleToken({
          tokenId: tokenIds[0],
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          provider: goerliProvider,
          discordMessageTopicArn: process.env.DISCORD_MESSAGE_TOPIC_ARN,
          testnet: true,
          sns,
        });
      } else {
        await notifyDiscordMultipleTokens({
          tokenIds,
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          provider: goerliProvider,
          testnet: true,
          discordMessageTopicArn: process.env.DISCORD_MESSAGE_TOPIC_ARN,
          sns,
        });
      }
    }

    for (const [to, events] of mainnetEventsByTo.entries()) {
      const tokenIds = events.map(({ args }) => args[2].toString());
      if (tokenIds.length === 1) {
        await notifyDiscordSingleToken({
          tokenId: tokenIds[0],
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          provider: mainnetProvider,
          discordMessageTopicArn: process.env.DISCORD_MESSAGE_TOPIC_ARN,
          testnet: false,
          sns,
        });
      } else {
        await notifyDiscordMultipleTokens({
          tokenIds,
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          provider: mainnetProvider,
          testnet: false,
          discordMessageTopicArn: process.env.DISCORD_MESSAGE_TOPIC_ARN,
          sns,
        });
      }
    }

    await Promise.all([
      db.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Item: {
            key: "lastBlockGoerli",
            value: latestBlockGoerli + 1,
          },
        })
      ),
      db.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Item: {
            key: "lastBlockMainnet",
            value: latestBlockMainnet + 1,
          },
        })
      ),
    ]);
  };
