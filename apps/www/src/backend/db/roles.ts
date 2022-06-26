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
import { IRole, RoleModel } from "models/roles";
import { UserRolesDAO } from "./userRoles";
import { IPaginatedResult, IPaginationOptions } from "backend/types";
import { decodeCursor, encodeCursor, paginate } from "backend/helpers";

export class RolesDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_ROLES || "Roles";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async create(role: IRole): Promise<RolesDAO> {
    await this.db.send(
      new PutCommand({
        TableName: RolesDAO.TABLE_NAME,
        Item: {
          ID: role.id,
          Name: role.name,
        },
      })
    );
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
      name: role.Item.Name,
    };
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
        name: role.Name,
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
        result.Items?.map((item) => new RoleModel(item.ID, item.Name)) ?? [],
      cursor,
      page,
      count,
      size,
    };
  }
}
