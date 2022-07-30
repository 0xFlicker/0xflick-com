import { Ownable__factory } from "@0xflick/contracts";
import { NextApiRequest } from "next";
import AWS from "aws-sdk";
import { jsonRpcProvider } from "./utils/provider";
import {
  IPaginationCursor,
  IPaginatedResult,
  IPaginationOptions,
} from "./types";
import { UserDAO } from "./db/user";
import { RolesDAO } from "./db/roles";
import { RolePermissionsDAO } from "./db/rolePermissions";
import { UserRolesDAO } from "./db/userRoles";
import { TwitterApi, TwitterApiTokens } from "twitter-api-v2";
import { deserializeSessionCookie } from "./utils/cookie";
import { DrinkerDAO } from "./db/drinker";
import { AuthOrchestrationDao } from "./db/auth/orchestration";
import { UrlShortenerDAO } from "./db/urlShortener";

/**
 * Configures all the DAOs.
 *
 * @returns the table region
 */
export async function fetchTableNames({
  region,
  paramName,
}: {
  paramName?: string;
  region?: string;
} = {}) {
  if (process.env.DYNAMODB_REGION === "local-env") {
    return process.env.DYNAMODB_REGION;
  }
  paramName = paramName ?? process.env.SSM_TABLE_NAMES ?? "DynamoDB_TableNames";
  region = region ?? process.env.SSM_TABLE_NAMES_REGION ?? "us-east-2";
  console.log(`Fetching table names... from ${paramName} in region ${region}`);
  const ssm = new AWS.SSM({
    region,
  });

  const result = await ssm
    .getParameter({
      Name: paramName,
    })
    .promise();
  const tableNames = JSON.parse(result.Parameter?.Value ?? "{}");
  UserDAO.TABLE_NAME = tableNames.userNonceTable ?? UserDAO.TABLE_NAME;
  RolesDAO.TABLE_NAME = tableNames.rolesTable ?? RolesDAO.TABLE_NAME;
  RolePermissionsDAO.TABLE_NAME =
    tableNames.rolesPermissionsTable ?? RolePermissionsDAO.TABLE_NAME;
  UserRolesDAO.TABLE_NAME =
    tableNames.userRolesTable ?? UserRolesDAO.TABLE_NAME;
  DrinkerDAO.TABLE_NAME = tableNames.drinkerTable ?? DrinkerDAO.TABLE_NAME;
  AuthOrchestrationDao.TABLE_NAME =
    tableNames.externalAuthTable ?? AuthOrchestrationDao.TABLE_NAME;
  UrlShortenerDAO.TABLE_NAME =
    tableNames.urlShortenerTable ?? UrlShortenerDAO.TABLE_NAME;
  return tableNames.region as string;
}

export function getAuthorizationToken(req: NextApiRequest): string | undefined {
  // First check cookie
  console.log(`Checking cookie... ${req.headers.cookie}`);
  const session = deserializeSessionCookie(req.headers.cookie);
  if (session) {
    return session;
  }
  const authorization = req.headers.authorization;
  if (!authorization) {
    return undefined;
  }
  const [, token] = authorization.split(" ");
  return token;
}

export function encodeCursor({
  lastEvaluatedKey,
  count,
  page,
}: {
  lastEvaluatedKey: any;
  count: number;
  page: number;
}): string | null {
  if (!lastEvaluatedKey) {
    return null;
  }
  return JSON.stringify({ lastEvaluatedKey, count, page });
}

export function decodeCursor(cursor?: string): IPaginationCursor | null {
  if (!cursor) {
    return null;
  }
  const { lastEvaluatedKey, count, page } = JSON.parse(cursor);
  return { lastEvaluatedKey, count, page };
}

export async function* paginate<Response>(
  fetcher: (options: IPaginationOptions) => Promise<IPaginatedResult<Response>>,
  options?: IPaginationOptions
): AsyncGenerator<Awaited<Response>, void, unknown> {
  let cursor = options?.cursor ?? null;
  let size = options?.limit;
  do {
    const result = await fetcher({
      cursor: cursor ?? undefined,
      limit: size,
    });
    cursor = result.cursor;
    for (const item of result.items) {
      yield item;
    }
  } while (cursor);
}

export function defaultChainId() {
  return process.env.NEXT_PUBLIC_CHAIN_ID || "1";
}

export function defaultProviderUrl(): string {
  if (!process.env.WEB3_RPC_URL) {
    throw new Error("WEB3_RPC_URL is not set");
  }
  return process.env.WEB3_RPC_URL;
}

export function getOwner(): () => Promise<string> {
  if (!process.env.NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT_CONTRACT_ADDRESS is not set");
  }
  const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;

  const promiseContractOwner = (() => {
    return async () => {
      const provider = jsonRpcProvider(defaultProviderUrl());
      const contract = Ownable__factory.connect(nftContractAddress, provider);
      const owner = await contract.owner();
      return owner;
    };
  })();
  return promiseContractOwner;
}

export function paginationOptions(req: NextApiRequest): IPaginationOptions {
  const cursor = Array.isArray(req.query.cursor)
    ? req.query.cursor[0]
    : req.query.cursor;

  const limitStr = Array.isArray(req.query.limit)
    ? req.query.limit[0]
    : req.query.limit;
  const limit = limitStr ? parseInt(limitStr) : undefined;
  return {
    cursor,
    limit,
  };
}

export function toPaginationResponse<T = unknown>(
  paginatedResponse: IPaginatedResult<T>
) {
  return {
    items: paginatedResponse.items,
    count: paginatedResponse.count,
    page: paginatedResponse.page,
    ...(paginatedResponse.cursor && { cursor: paginatedResponse.cursor }),
  };
}

export function getTwitterClient() {
  if (!process.env.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID) {
    console.error("NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID not set");
    process.exit(1);
  }
  const clientId = process.env.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID;

  if (!process.env.TWITTER_OAUTH_CLIENT_SECRET) {
    console.error("TWITTER_OAUTH_CLIENT_SECRET not set");
    process.exit(1);
  }
  const clientSecret = process.env.TWITTER_OAUTH_CLIENT_SECRET;

  const twitterApi = new TwitterApi({
    clientId,
    clientSecret,
  });
  return twitterApi;
}

export function getAppTwitterClient(
  opts?: Pick<TwitterApiTokens, "accessToken" | "accessSecret">
) {
  if (!process.env.TWITTER_APP_KEY) {
    console.error("TWITTER_APP_KEY not set");
    process.exit(1);
  }
  const appKey = process.env.TWITTER_APP_KEY;

  if (!process.env.TWITTER_APP_SECRET) {
    console.error("TWITTER_APP_SECRET not set");
    process.exit(1);
  }
  const appSecret = process.env.TWITTER_APP_SECRET;

  const twitterApi = new TwitterApi({
    appKey,
    appSecret,
    ...opts,
  });
  return twitterApi;
}
