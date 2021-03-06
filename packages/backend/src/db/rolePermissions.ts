import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { decodeCursor, encodeCursor, paginate } from "../helpers";
import { IPaginatedResult, IPaginationOptions } from "../types";
import type { EActions, EResource, IRolePermission } from "@0xflick/models";
import { RolePermissionModel } from "@0xflick/models";

export class RolePermissionsDAO {
  public static TABLE_NAME =
    process.env.TABLE_NAME_ROLE_PERMISSIONS || "RolePermissions";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public static idFor({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }) {
    return `${roleId}#${action}#${resource}${
      identifier ? `#${identifier}` : ""
    }`;
  }

  public async bind({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }): Promise<RolePermissionsDAO> {
    await this.db.send(
      new PutCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        Item: {
          RoleID_Action_Resource: RolePermissionsDAO.idFor({
            roleId,
            action,
            resource,
            identifier,
          }),
          RoleID: roleId,
          ActionType: action,
          ResourceType: resource,
          CreatedAt: Date.now(),
          ...(identifier ? { Identifier: identifier } : {}),
        },
      })
    );
    return this;
  }

  public async get({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }): Promise<null | RolePermissionModel> {
    const role = await this.db.send(
      new GetCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        Key: {
          RoleID_Action_Resource: RolePermissionsDAO.idFor({
            roleId,
            action,
            resource,
            identifier,
          }),
        },
      })
    );
    if (!role.Item) {
      return null;
    }
    return RolePermissionModel.fromJson({
      roleId: role.Item.RoleID,
      action: role.Item.ActionType,
      resource: role.Item.ResourceType,
      identifier: role.Item.Identifier,
    });
  }

  public async batchUnlinkByRoleId(roleId: string) {
    const entitiesToDelete: string[] = [];
    for await (const entity of this.getPermissions(roleId)) {
      entitiesToDelete.push(RolePermissionsDAO.idFor(entity));
    }
    await this.db.send(
      new BatchWriteCommand({
        RequestItems: {
          [RolePermissionsDAO.TABLE_NAME]: entitiesToDelete.map((id) => ({
            DeleteRequest: {
              Key: {
                RoleID_Action_Resource: id,
              },
            },
          })),
        },
      })
    );
  }

  public async unlink({
    roleId,
    action,
    resource,
    identifier,
  }: {
    roleId: string;
    action: EActions;
    resource: EResource;
    identifier?: string;
  }): Promise<RolePermissionsDAO> {
    await this.db.send(
      new DeleteCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        Key: {
          RoleID_Action_Resource: RolePermissionsDAO.idFor({
            roleId,
            action,
            resource,
            identifier,
          }),
        },
      })
    );
    return this;
  }

  public async getAllPermissions(roleId: string, options?: IPaginationOptions) {
    const permissions: IRolePermission[] = [];
    for await (const p of this.getPermissions(roleId, options)) {
      permissions.push(p);
    }
    return permissions;
  }

  public getPermissions(roleId: string, options?: IPaginationOptions) {
    return paginate(async (reqOptions) => {
      return this.getPermissionsPaginated(roleId, reqOptions);
    }, options);
  }

  public async getPermissionsPaginated(
    roleId: string,
    options?: IPaginationOptions
  ): Promise<IPaginatedResult<RolePermissionModel>> {
    const pagination = decodeCursor(options?.cursor);
    const permissions = await this.db.send(
      new QueryCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        KeyConditionExpression: "RoleID = :roleId",
        IndexName: "RoleIDIndex",
        ExpressionAttributeValues: {
          ":roleId": roleId,
        },
        ProjectionExpression: "RoleID, ActionType, ResourceType, Identifier",
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

    const lastEvaluatedKey = permissions.LastEvaluatedKey;
    const page = pagination ? pagination.page + 1 : 1;
    const size = permissions.Items?.length ?? 0;
    const count = (pagination ? pagination.count : 0) + size;

    return {
      items:
        permissions.Items?.map((role) =>
          RolePermissionModel.fromJson({
            roleId: role.RoleID,
            action: role.ActionType,
            resource: role.ResourceType,
            identifier: role.Identifier,
          })
        ) ?? [],
      cursor: encodeCursor({
        page,
        count,
        lastEvaluatedKey,
      }),
      page,
      count,
      size,
    };
  }

  public async findRolesWithPermission(action: EActions, resource: EResource) {
    const roles = await this.db.send(
      new ScanCommand({
        TableName: RolePermissionsDAO.TABLE_NAME,
        IndexName: "RoleByActionResourceIndex",
        FilterExpression: "ActionType = :action AND ResourceType = :resource",
        ExpressionAttributeValues: {
          ":action": action,
          ":resource": resource,
        },
      })
    );
    return (
      roles.Items?.map((role) =>
        RolePermissionModel.fromJson({
          roleId: role.RoleID,
          action: role.ActionType,
          resource: role.ResourceType,
          identifier: role.Identifier,
        })
      ) ?? []
    );
  }

  public async allowedActionsForRoleIds(
    roleIds: string[]
  ): Promise<Omit<IRolePermission, "roleId">[]> {
    const permissions = await Promise.all(
      roleIds.map((roleId) => this.getAllPermissions(roleId))
    );
    const permissionsMap = new Map<string, Omit<IRolePermission, "roleId">>();
    permissions.forEach((permission) => {
      permission.forEach((permission) => {
        permissionsMap.set(RolePermissionsDAO.idFor(permission), permission);
      });
    });
    return Array.from(permissionsMap.values()).map(
      ({ action, resource, identifier }) => ({
        action,
        resource,
        identifier,
      })
    );
  }
}
