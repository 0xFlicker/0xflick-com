import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  BatchGetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { RolePermissionsDAO } from "./rolePermissions";
import { IRole, RoleModel } from "@0xflick/models";
import { UserRolesDAO } from "./userRoles";
import { IPaginatedResult, IPaginationOptions } from "../types";
import { decodeCursor, encodeCursor, paginate } from "../helpers";
import { createLogger } from "../utils";

const logger = createLogger({
  name: "db/roles",
});

export class RolesDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_ROLES || "Roles";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async create(role: Omit<IRole, "userCount">): Promise<RolesDAO> {
    try {
      await this.db.send(
        new PutCommand({
          TableName: RolesDAO.TABLE_NAME,
          Item: {
            ID: role.id,
            RoleName: role.name,
            UserCount: 0,
          },
          ConditionExpression: "attribute_not_exists(ID)",
        })
      );
    } catch (e) {
      // Check if this error is a known DynamoDB error
      if (e instanceof Error && e.name === "ConditionalCheckFailedException") {
        logger.warn("RolesDao: Duplicate entry on create", role);
        // Duplicate entry, whatever. continue but don't update any counters
      } else {
        // Something else went wrong, rethrow
        throw e;
      }
    }

    return this;
  }

  public async get(roleId: string): Promise<IRole | null> {
    const role = await this.db.send(
      new GetCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          ID: roleId,
        },
      })
    );
    if (!role.Item) {
      return null;
    }
    return {
      id: role.Item.ID,
      name: role.Item.RoleName,
      userCount: role.Item.UserCount || 0,
    };
  }

  public async usersBound(roleId: string, count: number = 1) {
    // Increment UserCount
    await this.db.send(
      new UpdateCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          ID: roleId,
        },
        UpdateExpression: "set UserCount = UserCount + :inc",
        ExpressionAttributeValues: {
          ":inc": count,
        },
      })
    );
    return this;
  }

  public async usersRemoved(roleId: string, count: number = 1) {
    // Decrement UserCount
    await this.db.send(
      new UpdateCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          ID: roleId,
        },
        UpdateExpression: "set UserCount = UserCount - :inc",
        ExpressionAttributeValues: {
          ":inc": count,
        },
      })
    );
    return this;
  }

  public async addPermissions(
    roleId: string,
    permissionsIds: string[]
  ): Promise<RolesDAO> {
    await this.db.send(
      new UpdateCommand({
        TableName: RolesDAO.TABLE_NAME,
        Key: {
          ID: roleId,
        },
        UpdateExpression:
          "SET PermissionIds = list_append(PermissionIds, :permissionsIds)",
        ExpressionAttributeValues: {
          ":permissionsIds": permissionsIds,
        },
      })
    );
    return this;
  }

  public async deleteRole(
    rbacDao: UserRolesDAO,
    rolePermissionsDao: RolePermissionsDAO,
    roleId: string
  ): Promise<RolesDAO> {
    await Promise.all([
      this.db.send(
        new DeleteCommand({
          TableName: RolesDAO.TABLE_NAME,
          Key: {
            ID: roleId,
          },
        })
      ),
      rbacDao.batchUnlinkByRoleId(roleId),
      rolePermissionsDao.batchUnlinkByRoleId(roleId),
    ]);
    return this;
  }

  public async getRoles(roleIds: string[]): Promise<IRole[]> {
    const roles = await this.db.send(
      new BatchGetCommand({
        RequestItems: {
          [RolesDAO.TABLE_NAME]: {
            Keys: roleIds.map((id) => ({ ID: id })),
            ConsistentRead: true,
          },
        },
      })
    );
    return (
      roles.Responses?.[RolesDAO.TABLE_NAME].map((role) => ({
        id: role.ID,
        name: role.RoleName,
        userCount: role.UserCount ?? 0,
      })) ?? []
    );
  }

  public async getRoleByName(name: string): Promise<IRole[] | null> {
    const result = await this.db.send(
      new ScanCommand({
        TableName: RolesDAO.TABLE_NAME,
        IndexName: "RolesByNameIndex",
        FilterExpression: "RoleName = :name",
        ExpressionAttributeValues: {
          ":name": name,
        },
      })
    );
    return (
      result.Items?.map((item) => ({
        id: item.ID,
        name: item.RoleName,
        userCount: item.UserCount ?? 0,
      })) ?? []
    );
  }

  public listAll() {
    return paginate((options) => this.listAllPaginated(options));
  }

  public async listAllPaginated(
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<RoleModel>> {
    const pagination = decodeCursor(options?.cursor);
    const result = await this.db.send(
      new ScanCommand({
        TableName: RolesDAO.TABLE_NAME,
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
      items:
        result.Items?.map(
          (item) => new RoleModel(item.ID, item.RoleName, item.UserCount ?? 0)
        ) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }
}
