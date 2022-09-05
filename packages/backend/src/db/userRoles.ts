import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { decodeCursor, encodeCursor, paginate } from "../helpers";
import { IPaginatedResult, IPaginationOptions } from "../types";
import { createLogger } from "../utils";
import { RolesDAO } from "./roles";

const logger = createLogger({
  name: "db/userRoles",
});

export class UserRolesDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_USER_ROLES || "UserRoles";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public static idFor(address: string, roleId: string) {
    return `${address}#${roleId}`;
  }

  public async bind({
    address,
    roleId,
    rolesDao,
  }: {
    address: string;
    roleId: string;
    rolesDao: RolesDAO;
  }): Promise<UserRolesDAO> {
    let wasBound = true;
    try {
      await this.db.send(
        new PutCommand({
          TableName: UserRolesDAO.TABLE_NAME,
          Item: {
            Address_RoleID: UserRolesDAO.idFor(address, roleId),
            Address: address,
            RoleID: roleId,
            CreatedAt: Date.now(),
          },
          ConditionExpression: "attribute_not_exists(Address_RoleID)",
        })
      );
    } catch (e: unknown) {
      // Check if this error is a known DynamoDB error
      if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
        logger.warn("UserRolesDAO.bind: Duplicate entry", {
          address,
          roleId,
        });
        // Duplicate entry, whatever. continue but don't update any counters
        wasBound = false;
      } else {
        // Something else went wrong, rethrow
        throw e;
      }
    }
    if (wasBound) {
      await rolesDao.usersBound(roleId);
    }
    return this;
  }

  public async unlink({
    address,
    roleId,
    rolesDao,
  }: {
    address: string;
    roleId: string;
    rolesDao: RolesDAO;
  }): Promise<UserRolesDAO> {
    let wasRemoved = true;
    try {
      await this.db.send(
        new DeleteCommand({
          TableName: UserRolesDAO.TABLE_NAME,
          Key: {
            Address_RoleID: UserRolesDAO.idFor(address, roleId),
          },
          ConditionExpression: "attribute_exists(Address_RoleID)",
        })
      );
    } catch (e) {
      // Check if this error is a known DynamoDB error
      if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
        logger.warn("UserRolesDAO.bind: Already deleted", {
          address,
          roleId,
        });
        // Entry already gone... whatever. continue but don't update any counters
        wasRemoved = false;
      } else {
        // Something else went wrong, rethrow
        throw e;
      }
    }
    if (wasRemoved) {
      await rolesDao.usersRemoved(roleId);
    }
    return this;
  }

  public async batchUnlinkByRoleId(roleId: string): Promise<UserRolesDAO> {
    const entriesToDeleteIds: string[] = [];
    for await (const item of paginate<string>(
      async (options: IPaginationOptions) => {
        const pagination = decodeCursor(options?.cursor);
        const result = await this.db.send(
          new QueryCommand({
            TableName: UserRolesDAO.TABLE_NAME,
            IndexName: "RoleIDIndex",
            KeyConditionExpression: "RoleID = :roleId",
            ExpressionAttributeValues: {
              ":roleId": roleId,
            },
            ProjectionExpression: "Address_RoleID",
            ...(pagination
              ? {
                  ExclusiveStartKey: pagination.lastEvaluatedKey,
                }
              : {}),
          })
        );
        const lastEvaluatedKey = result.LastEvaluatedKey;
        const page = pagination ? pagination.page + 1 : 1;
        const size = result.Items?.length ?? 0;
        const count = (pagination ? pagination.count : 0) + size;
        const cursor = encodeCursor({ lastEvaluatedKey, page, count });
        return {
          items: result.Items?.map((item) => item.Address_RoleID) ?? [],
          cursor,
          page,
          count,
          size,
        };
      }
    )) {
      entriesToDeleteIds.push(item);
    }
    if (entriesToDeleteIds.length > 0) {
      await this.db.send(
        new BatchWriteCommand({
          RequestItems: {
            [UserRolesDAO.TABLE_NAME]: entriesToDeleteIds.map(
              (Address_RoleID) => ({
                DeleteRequest: {
                  Key: {
                    Address_RoleID,
                  },
                },
              })
            ),
          },
        })
      );
    }

    return this;
  }

  public async getRoleIdsPaginated(
    address: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<string>> {
    const pagination = decodeCursor(options?.cursor);
    const result = await this.db.send(
      new QueryCommand({
        TableName: UserRolesDAO.TABLE_NAME,
        IndexName: "AddressIndex",
        KeyConditionExpression: "Address = :address",
        ExpressionAttributeValues: {
          ":address": address,
        },
        ProjectionExpression: "RoleID",
        ScanIndexForward: true,
        ...(pagination
          ? {
              ExclusiveStartKey: pagination.lastEvaluatedKey,
            }
          : {}),
        ...(options?.limit
          ? {
              Limit: options.limit,
            }
          : {}),
      })
    );
    const lastEvaluatedKey = result.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = result.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;
    const cursor = encodeCursor({ lastEvaluatedKey, page, count });
    return {
      items: result.Items?.map((item) => item.RoleID) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }

  public async getAllRoleIds(address: string) {
    const roleIds: string[] = [];
    for await (const roleId of this.getRoleIds(address)) {
      roleIds.push(roleId);
    }
    return roleIds;
  }

  public getRoleIds(address: string) {
    return paginate((options) => this.getRoleIdsPaginated(address, options));
  }

  public async getAddressesPaginated(
    roleId: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<string>> {
    const pagination = decodeCursor(options?.cursor);
    const result = await this.db.send(
      new QueryCommand({
        TableName: UserRolesDAO.TABLE_NAME,
        IndexName: "RoleIDIndex",
        KeyConditionExpression: "RoleID = :roleId",
        ExpressionAttributeValues: {
          ":roleId": roleId,
        },
        ProjectionExpression: "Address",
        ScanIndexForward: true,
        ...(pagination
          ? {
              ExclusiveStartKey: pagination.lastEvaluatedKey,
            }
          : {}),
        ...(options?.limit
          ? {
              Limit: options.limit,
            }
          : {}),
      })
    );
    const lastEvaluatedKey = result.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = result.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;
    const cursor = encodeCursor({ lastEvaluatedKey, page, count });
    return {
      items: result.Items?.map((item) => item.Address) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }

  public getAddresses(roleId: string) {
    return paginate<string>((options) =>
      this.getAddressesPaginated(roleId, options)
    );
  }

  public async getAllAddresses(roleId: string) {
    const addresses: string[] = [];
    for await (const address of this.getAddresses(roleId)) {
      addresses.push(address);
    }
    return addresses;
  }
}
