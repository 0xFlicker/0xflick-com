// import { EventBridgeEvent } from "aws-lambda";
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
  namedLadyRendererABI,
  namedLadyRendererAddress,
  readFameLadySquad,
} from "./generated";
import { SNS } from "@aws-sdk/client-sns";
import { APIEmbedField } from "discord-api-types/v10";
import { sendDiscordMessage } from "@0xflick/backend/discord/send";
import { createLogger } from "@0xflick/backend";
// import { configureChains, mainnet, createClient } from "wagmi";
import { createPublicClient, http, fallback, zeroHash } from "viem";
import { mainnet, sepolia } from "viem/chains";

type PromiseType<T extends Promise<any>> = T extends Promise<infer U>
  ? U
  : never;

const logger = createLogger({
  name: "fls-wrapper-event",
});

const sepoliaClient = createPublicClient({
  transport: fallback([
    http(`https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`, {
      batch: true,
    }),
    http(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      {
        batch: true,
      }
    ),
  ]),
  chain: sepolia,
});
const mainnetClient = createPublicClient({
  transport: fallback([
    http(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`, {
      batch: true,
    }),
    http(`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`, {
      batch: true,
    }),
  ]),
  chain: mainnet,
});

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
  client: typeof sepoliaClient | typeof mainnetClient,
  contractAddress: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint
) {
  const events = await client.getLogs({
    address: contractAddress,
    fromBlock,
    toBlock,
    event: {
      type: "event",
      anonymous: false,
      inputs: [
        {
          name: "from",
          internalType: "address",
          type: "address",
          indexed: true,
        },
        { name: "to", internalType: "address", type: "address", indexed: true },
        {
          name: "tokenId",
          internalType: "uint256",
          type: "uint256",
          indexed: true,
        },
      ],
      name: "Transfer",
    } as const,
  });
  // Only interested in events that have from address 0x0 (new mints)
  const filteredEvents = events.filter((event) => {
    return event.args.from === zeroHash;
  });
  const ret = filteredEvents.map((event) => {
    return {
      ...event,
      blockNumber: event.blockNumber,
    };
  });
  logger.info(`Found ${ret.length} events`);
  return ret;
}

async function notifyDiscordSingleToken({
  tokenId,
  wrappedCount,
  toAddress,
  channelId,
  client,
  testnet,
  discordMessageTopicArn,
  sns,
}: {
  tokenId: string;
  wrappedCount: number;
  toAddress: `0x${string}`;
  channelId: string;
  client: typeof sepoliaClient | typeof mainnetClient;
  testnet: boolean;
  discordMessageTopicArn: string;
  sns: SNS;
}) {
  const ensName = await client.getEnsName({ address: toAddress });
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
      name: "sepolia",
      value: "true",
      inline: true,
    });
  }
  fields.push({
    name: "wrapped",
    value: wrappedCount.toString(),
    inline: true,
  });

  await sendDiscordMessage({
    channelId,
    message: {
      embeds: [
        {
          title: "#itsawrap",
          description: `A new Fame Lady Society was wrapped${
            testnet ? " on Sepolia" : ""
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
  wrappedCount,
  toAddress,
  channelId,
  client,
  testnet,
  discordMessageTopicArn,
  sns,
}: {
  tokenIds: string[];
  wrappedCount: number;
  toAddress: `0x${string}`;
  channelId: string;
  client: typeof sepoliaClient | typeof mainnetClient;
  testnet: boolean;
  discordMessageTopicArn: string;
  sns: SNS;
}) {
  let ensName: string;
  try {
    ensName = await client.getEnsName({ address: toAddress });
  } catch (e) {
    logger.error(e, "Failed to lookup address", toAddress);
    ensName = toAddress;
  }
  const displayName = ensName ? ensName : toAddress;
  const fields: APIEmbedField[] = [];
  fields.push({
    name: "new",
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
      name: "sepolia",
      value: "true",
      inline: true,
    });
  }
  fields.push({
    name: "wrapped",
    value: wrappedCount.toString(),
    inline: true,
  });
  await sendDiscordMessage({
    channelId,
    message: {
      embeds: [
        {
          title: "#itsawrap",
          description: `Fame Lady Society were wrapped${
            testnet ? " on Sepolia" : ""
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
    // Get last bock read
    const [lastBlockSepoliaResponse, lastBlockMainnetResponse] =
      await Promise.all([
        db.send(
          new GetCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
              key: "lastBlockSepolia",
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

    const [latestBlockSepolia, latestBlockMainnet] = await Promise.all([
      sepoliaClient.getBlockNumber(),
      mainnetClient.getBlockNumber(),
    ]);

    const lastBlockSepolia = BigInt(
      lastBlockSepoliaResponse.Item?.value ?? latestBlockSepolia
    );
    const lastBlockMainnet = BigInt(
      lastBlockMainnetResponse.Item?.value ?? latestBlockMainnet
    );

    // Get events from last block read
    const [sepoliaEvents, mainnetEvents] = await Promise.all([
      findEvents(
        sepoliaClient,
        wrappedNftAddress[5],
        lastBlockSepolia,
        latestBlockSepolia
      ),
      findEvents(
        mainnetClient,
        fameLadySocietyAddress[1],
        lastBlockMainnet,
        latestBlockMainnet
      ),
    ]);

    // Notify discord
    const sns = new SNS({});
    // Group events by to address
    const sepoliaEventsByTo = new Map<
      `0x${string}`,
      PromiseType<ReturnType<typeof findEvents>>
    >();
    const mainnetEventsByTo = new Map<
      `0x${string}`,
      PromiseType<ReturnType<typeof findEvents>>
    >();
    for (const event of sepoliaEvents) {
      const events = sepoliaEventsByTo.get(event.args.to) || [];
      events.push(event);
      sepoliaEventsByTo.set(event.args.to, events);
    }
    for (const event of mainnetEvents) {
      const events = mainnetEventsByTo.get(event.args.to) || [];
      events.push(event);
      mainnetEventsByTo.set(event.args.to, events);
    }
    // get total wrapped count of fame lady society
    // fameLadySquadInterface.balanceOf(fameLadySocietyAddress[1])
    const wrappedCountBigNumber = await readFameLadySquad({
      functionName: "balanceOf",
      args: [fameLadySocietyAddress[1]],
    });
    const wrappedCount = wrappedCountBigNumber.toNumber();

    // Now push out the events
    for (const [to, events] of sepoliaEventsByTo.entries()) {
      const tokenIds = events.map(({ args }) => args.tokenId.toString());
      if (tokenIds.length === 1) {
        await notifyDiscordSingleToken({
          tokenId: tokenIds[0],
          wrappedCount: 0, // fake
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          client: sepoliaClient,
          discordMessageTopicArn: process.env.DISCORD_MESSAGE_TOPIC_ARN,
          testnet: true,
          sns,
        });
      } else {
        await notifyDiscordMultipleTokens({
          tokenIds,
          wrappedCount: 0, // fake
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          client: sepoliaClient,
          testnet: true,
          discordMessageTopicArn: process.env.DISCORD_MESSAGE_TOPIC_ARN,
          sns,
        });
      }
    }

    for (const [to, events] of mainnetEventsByTo.entries()) {
      const tokenIds = events.map(({ args }) => args.tokenId.toString());
      if (tokenIds.length === 1) {
        await notifyDiscordSingleToken({
          tokenId: tokenIds[0],
          wrappedCount,
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          client: mainnetClient,
          discordMessageTopicArn: process.env.DISCORD_MESSAGE_TOPIC_ARN,
          testnet: false,
          sns,
        });
      } else {
        await notifyDiscordMultipleTokens({
          tokenIds,
          wrappedCount,
          toAddress: to,
          channelId: process.env.DISCORD_CHANNEL_ID,
          client: mainnetClient,
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
            key: "lastBlockSepolia",
            value: Number(latestBlockSepolia + 1n),
          },
        })
      ),
      db.send(
        new PutCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Item: {
            key: "lastBlockMainnet",
            value: Number(latestBlockMainnet + 1n),
          },
        })
      ),
    ]);
  };
