import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getOwner } from "backend/helpers";
import { EActions, EResource } from "models/permissions";
import { UserModel, IUser, UserWithRolesModel } from "models/user";
import { RolePermissionsDAO } from "./rolePermissions";
import { UserRolesDAO } from "./userRoles";

const promiseContractOwner = getOwner();

export class UserDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_USER_NONCE || "UserNonce";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async create(user: Omit<IUser, "nonce">): Promise<UserModel> {
    await this.db.send(
      new PutCommand({
        TableName: UserDAO.TABLE_NAME,
        Item: {
          Address: user.address,
          Nonce: 0,
        },
      })
    );
    return UserModel.fromJson({
      address: user.address,
      nonce: 0,
    });
  }

  public async incSessionNonce(address: string): Promise<UserDAO> {
    await this.db.send(
      new UpdateCommand({
        TableName: UserDAO.TABLE_NAME,
        Key: {
          Address: address,
        },
        UpdateExpression: "SET Nonce = Nonce + :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
        },
      })
    );
    return this;
  }

  public async getUser(address: string): Promise<UserModel | null> {
    const userRecord = await this.db.send(
      new GetCommand({
        TableName: UserDAO.TABLE_NAME,
        Key: { Address: address },
      })
    );
    if (!userRecord.Item) {
      return null;
    }
    return new UserModel({
      address: userRecord.Item.Address,
      nonce: userRecord.Item.Nonce,
    });
  }

  public async getUserWithRoles(
    userRolesDao: UserRolesDAO,
    address: string
  ): Promise<UserWithRolesModel | null> {
    const user = await this.getUser(address);
    if (!user) {
      return null;
    }
    // Fetch all roles
    const roleIds = await userRolesDao.getAllRoleIds(address);
    console.log(`User ${address} has roles ${roleIds}`);
    return new UserWithRolesModel({
      ...user,
      roleIds,
    });
  }

  public async allowedActionsForAddress(
    userRoles: UserRolesDAO,
    rolePermissionsDao: RolePermissionsDAO,
    address: string
  ) {
    const user = await this.getUserWithRoles(userRoles, address);
    if (!user) {
      return null;
    }
    // Fetch permissions for all roles
    const permissions = await rolePermissionsDao.allowedActionsForRoleIds(
      user.roleIds
    );
    return permissions;
  }

  public async canPerformAction(
    userRoles: UserRolesDAO,
    rolePermissionsDao: RolePermissionsDAO,
    address: string,
    possibilities: [EActions, EResource][] | [EActions, EResource]
  ): Promise<[EActions, EResource] | null> {
    const permissions = await this.allowedActionsForAddress(
      userRoles,
      rolePermissionsDao,
      address
    );
    if (!permissions) {
      return null;
    }
    const allPossibilities: [EActions, EResource][] = [];
    if (possibilities.length > 1) {
      if (Array.isArray(possibilities[0])) {
        allPossibilities.push(...(possibilities as [EActions, EResource][]));
      } else {
        allPossibilities.push(possibilities as [EActions, EResource]);
      }
    }
    for (const permission of permissions) {
      for (const [action, resource] of allPossibilities) {
        if (
          permission.action === EActions.ADMIN &&
          (permission.resource === resource || resource === EResource.ALL)
        ) {
          return [action, resource];
        }
        if (permission.action === action && permission.resource === resource) {
          return [action, resource];
        }
      }
    }
    // Check if user is owner (super-admin)
    const owner = await promiseContractOwner();
    const isOwner = owner.toLowerCase() === address.toLowerCase();
    return isOwner ? [EActions.ADMIN, EResource.ALL] : null;
  }
}
