import { Ownable__factory } from "contracts";
import { NextApiRequest } from "next";
import AWS from "aws-sdk";
import { jsonRpcProvider } from "utils/providers";
import {
  IPaginationCursor,
  IPaginatedResult,
  IPaginationOptions,
} from "./types";
import { UserDAO } from "./db/user";
import { RolesDAO } from "./db/roles";
import { RolePermissionsDAO } from "./db/rolePermissions";
import { UserRolesDAO } from "./db/userRoles";

export function fetchTableNames() {
  if (
    !process.env.SSM_TABLE_NAMES ||
    process.env.DYNAMODB_REGION === "local-env"
  ) {
    return Promise.resolve();
  }
  console.log(`Fetching table names... from ${process.env.SSM_TABLE_NAMES}`);

  const ssm = new AWS.SSM({
    region: "us-east-1",
  });

  const promiseTableName = ssm
    .getParameter({ Name: process.env.SSM_TABLE_NAMES || "" })
    .promise();
  return promiseTableName.then((result) => {
    const tableNames = JSON.parse(result.Parameter?.Value ?? "{}");
    UserDAO.TABLE_NAME = tableNames.userNonceTable ?? UserDAO.TABLE_NAME;
    RolesDAO.TABLE_NAME = tableNames.rolesTable ?? RolesDAO.TABLE_NAME;
    RolePermissionsDAO.TABLE_NAME =
      tableNames.rolesPermissionsTable ?? RolePermissionsDAO.TABLE_NAME;
    UserRolesDAO.TABLE_NAME =
      tableNames.userRolesTable ?? UserRolesDAO.TABLE_NAME;
  });
}

export function getAuthorizationToken(req: NextApiRequest): string | undefined {
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

export function defaultProviderUrl(): string {
  if (!process.env.WEB3_RPC) {
    throw new Error("WEB3_RPC is not set");
  }

  return process.env.WEB3_RPC;
}

export function getOwner(contractAddress: string): () => Promise<string> {
  const promiseContractOwner = (() => {
    return async () => {
      const provider = jsonRpcProvider(defaultProviderUrl());
      const contract = Ownable__factory.connect(contractAddress, provider);
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
