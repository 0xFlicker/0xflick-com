import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { providers, Wallet, utils, BigNumber } from "ethers";
import {
  createLogger,
  DrinkerDAO,
  Drinker,
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

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? [];

const RATE_LIMIT_ADDRESS = Number(process.env.RATE_LIMIT_ADDRESS ?? 1);
const RATE_LIMIT_IP = Number(process.env.RATE_LIMIT_IP ?? 1);
const RATE_LIMIT_GLOBAL = Number(process.env.RATE_LIMIT_GLOBAL ?? 2);

const provider = new providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const value = utils.parseEther(process.env.VALUE);

function addCorsHeaders(
  headers: Record<string, string>,
  origin: string
): Record<string, string> {
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.includes(origin);
}

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
  logger.info(
    {
      method: event.httpMethod,
      path: event.path,
      headers: event.headers,
      body: event.body,
    },
    "Received request"
  );
  // Check OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    const origin = event.headers.origin;
    if (!origin) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Origin not set" }),
      };
    }
    if (!isAllowedOrigin(origin)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Origin not allowed" }),
      };
    }
    return {
      statusCode: 200,
      headers: addCorsHeaders(
        {
          "Access-Control-Allow-Methods": "POST, GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
        origin
      ),
      body: "",
    };
  }
  const ip =
    event.headers["x-real-ip"] ?? event.headers["x-forwarded-for"] ?? "";
  // for GET, return faucet details about price and rate limit
  if (event.httpMethod === "GET") {
    // Get the remaining balance of the faucet
    const balance = await wallet.getBalance();
    const ether = utils.formatEther(balance);
    const etherRound = Math.round(parseFloat(ether));
    logger.info(`Faucet balance: ${ether} SEP`);
    return {
      statusCode: 200,
      headers: addCorsHeaders(
        {
          "Content-Type": "application/json",
        },
        event.headers.origin
      ),
      body: JSON.stringify({
        remainingBalance: `${etherRound} SEP`,
        value: `${process.env.VALUE} SEP`,
        rateLimitAddress: RATE_LIMIT_ADDRESS,
        rateLimitIp: RATE_LIMIT_IP,
      }),
    };
  }
  // check balance
  const remainingBalance = await wallet.getBalance();
  if (remainingBalance.lt(value)) {
    logger.error(
      `Faucet balance ${utils.formatEther(
        remainingBalance
      )} is less than ${utils.formatEther(value)}`
    );
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faucet is dry" }),
      headers: addCorsHeaders(
        {
          "Content-Type": "application/json",
        },
        event.headers.origin
      ),
    };
  }

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
        headers: addCorsHeaders(
          {
            "Content-Type": "application/json",
          },
          event.headers.origin
        ),
      };
    }
    // Check if address is an EOA
    const code = await provider.getCode(body.to);
    if (code !== "0x") {
      logger.error(`Address ${body.to} is a contract`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Contract addresses not supported" }),
        headers: addCorsHeaders(
          {
            "Content-Type": "application/json",
          },
          event.headers.origin
        ),
      };
    }

    // check global rate limit
    let drinker: Drinker | null;
    drinker = await drinkerDao.isAlcoholic("global");
    if (drinker && drinker.remainingCount <= 0) {
      logger.info(
        `Global rate limit reached with ${drinker.remainingCount} remaining`
      );
      return {
        statusCode: 429,
        body: JSON.stringify({
          remainingTime: -666,
        }),
        headers: addCorsHeaders(
          {
            "Content-Type": "application/json",
          },
          event.headers.origin
        ),
      };
    }
    if (!drinker) {
      drinker = Drinker.fromJson({
        key: "global",
        remainingCount: RATE_LIMIT_GLOBAL,
        ttl:
          Math.floor(Date.now() / 1000) + 60 * 60 + (Math.random() * 720 - 360),
      });
      await drinkerDao.brew(drinker);
    }

    logger.info(`Check if to: ${body.to} is alcoholic`);
    drinker = await drinkerDao.isAlcoholic(body.to);
    if (drinker && drinker.remainingCount <= 0) {
      logger.info(
        `${body.to} is alcoholic with ${drinker.remainingCount} remaining`
      );
      return {
        statusCode: 429,
        body: JSON.stringify({
          remainingTime: drinker.ttl - Math.floor(Date.now() / 1000),
        }),
        headers: addCorsHeaders(
          {
            "Content-Type": "application/json",
          },
          event.headers.origin
        ),
      };
    }
    if (!drinker) {
      drinker = Drinker.fromJson({
        key: body.to,
        remainingCount: RATE_LIMIT_ADDRESS,
      });
      await drinkerDao.brew(drinker);
    }

    if (ip !== "") {
      logger.info(`Check if to: ${ip} is alcoholic`);
      drinker = await drinkerDao.isAlcoholic(ip);
      if (drinker && drinker.remainingCount <= 0) {
        logger.info(
          `${ip} is alcoholic with ${drinker.remainingCount} remaining`
        );
        return {
          statusCode: 429,
          body: JSON.stringify({
            remainingTime: drinker.ttl - Math.floor(Date.now() / 1000),
          }),
          headers: addCorsHeaders(
            {
              "Content-Type": "application/json",
            },
            event.headers.origin
          ),
        };
      }
      if (!drinker) {
        drinker = Drinker.fromJson({
          key: ip,
          remainingCount: RATE_LIMIT_IP,
        });
        await drinkerDao.brew(drinker);
      }
    }

    logger.info(`Checking recaptcha ${JSON.stringify(body)}`);
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET,
        response: body.token,
        remoteip:
          event.headers["x-real-ip"] || event.headers["x-forwarded-for"],
      }),
      {
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
        headers: addCorsHeaders(
          {
            "Content-Type": "application/json",
          },
          event.headers.origin
        ),
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
    await drinkerDao.drank({
      key: "global",
    });
    if (ip !== "") {
      await drinkerDao.drank({
        key: ip,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        txHash: tx.hash,
        remainingCount: drinker.remainingCount - 1,
      }),
      headers: addCorsHeaders(
        {
          "Content-Type": "application/json",
        },
        event.headers.origin
      ),
    };
  } catch (error) {
    logger.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: addCorsHeaders(
        {
          "Content-Type": "application/json",
        },
        event.headers.origin
      ),
    };
  }
};
