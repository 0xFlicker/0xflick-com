import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import axios from "axios";
import { providers, Wallet, utils } from "ethers";
import {
  createLogger,
  getDb,
  DrinkerDAO,
  createDb,
  fetchTableNames,
} from "@0xflick/backend";

const logger = createLogger({
  name: "discord/lambda/discord",
});

if (!process.env.PRIVATE_KEY) {
  logger.error("PRIVATE_KEY not set");
  process.exit(1);
}
if (!process.env.RPC_URL) {
  logger.error("RPC_URL not set");
  process.exit(1);
}
if (!process.env.VALUE) {
  logger.error("VALUE not set");
  process.exit(1);
}
if (!process.env.RECAPTCHA_SECRET) {
  logger.error("RECAPTCHA_SECRET not set");
  process.exit(1);
}

const provider = new providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const value = utils.parseEther(process.env.VALUE);

const promiseDao = Promise.resolve().then(async () => {
  logger.info(
    `Creating db... with ${process.env.SSM_PARAM_NAME} and ${process.env.SSM_REGION}`
  );
  const region = await fetchTableNames({
    region: process.env.SSM_REGION,
    paramName: process.env.SSM_PARAM_NAME,
  });
  const db = createDb({
    region,
  });
  return new DrinkerDAO(db);
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const drinkerDao = await promiseDao;
  try {
    const strBody = event.body;
    if (!strBody) {
      throw new Error("Body is not set");
    }

    const body = JSON.parse(strBody);
    if (utils.isAddress(body.to) === false) {
      logger.error(`Invalid address ${body.to}`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid address" }),
      };
    }

    logger.info(`Check if to: ${body.to} is alcoholic`);
    const drinker = await drinkerDao.isAlcoholic(body.to);
    if (drinker && drinker.remainingCount > 0) {
      logger.info(
        `${body.to} is alcoholic with ${drinker.remainingCount} remaining`
      );
      return {
        statusCode: 429,
        body: JSON.stringify({
          remainingTime: drinker.ttl - Math.floor(Date.now() / 1000),
        }),
      };
    } else {
      await drinkerDao.brew({ key: body.to, remainingCount: 0 });
    }

    logger.info(`Checking recaptcha ${JSON.stringify(body)}`);
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        secret: process.env.RECAPTCHA_SECRET,
        response: body.token,
        ...(body.remoteip
          ? {
              remoteip: body.remoteip,
            }
          : {}),
      },
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: body.token,
          ...(body.remoteip
            ? {
                remoteip: body.remoteip,
              }
            : {}),
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      }
    );
    if (!response.data.success) {
      logger.error(
        `Recaptcha failed ${JSON.stringify(response.data?.["error-codes"])}`
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "reCAPTCHA failed" }),
      };
    }
    logger.info(`Sending ${value} to ${body.to}`);
    const tx = await wallet.sendTransaction({
      to: body.to,
      value,
      data: utils.toUtf8Bytes("Thanks for using 0xflick's faucet!"),
    });
    logger.info(
      `Sent ${value} to ${body.to} txHash: ${tx.hash} and remainingCount: ${drinker.remainingCount}`
    );
    await drinkerDao.drank({
      key: body.to,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({
        txHash: tx.hash,
        remainingCount: drinker.remainingCount - 1,
      }),
    };
  } catch (error) {
    logger.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
