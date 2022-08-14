import { gql } from "apollo-server-core";
import { IFieldResolver } from "@graphql-tools/utils";
import { IUser } from "@0xflick/models";

import { TContext } from "../../context";
import { TGraphqlResolver } from "../../types";
import { IGraphqlRole, IGraphqlPermission } from "../admin/roles";
import { bindUserToRole } from "../../controllers/admin/roles";

export interface IGraphqlWeb3User {
  address: string;
  nonce: number;
  roles: IGraphqlRole[];
  allowedActions: IGraphqlPermission[];
}

export const typeSchema = gql`
  type Web3User {
    address: ID!
    nonce: Int!
    roles: [Role!]!
    allowedActions: [Permission!]!
    bindToRole(roleId: String!): Web3User!
  }

  type Web3LoginUser {
    address: ID!
    user: Web3User!
    token: String!
  }
`;

const roleBindToUserResolver: IFieldResolver<
  IUser,
  TContext,
  { roleId: string },
  Promise<IUser>
> = async ({ address: userAddress }, { roleId }, context, info) => {
  return await bindUserToRole(context, info, {
    userAddress,
    roleId,
  });
};

export const resolvers = {
  Web3User: {
    bindToRole: roleBindToUserResolver,
    allowedActions: (async (
      user,
      _,
      { userDao, userRolesDao, rolePermissionsDao }
    ) => {
      const userRoles = await userDao.getUserWithRoles(
        userRolesDao,
        user.address
      );
      return await rolePermissionsDao.allowedActionsForRoleIds(
        userRoles.roleIds
      );
    }) as IFieldResolver<
      IUser,
      TContext,
      unknown,
      Promise<IGraphqlPermission[]>
    >,
    roles: (async (
      user,
      _,
      { rolePermissionsDao, rolesDao, userDao, userRolesDao }
    ) => {
      const userRoles = await userDao.getUserWithRoles(
        userRolesDao,
        user.address
      );
      return await Promise.all(
        userRoles.roleIds.map(async (roleId) => {
          const { name } = await rolesDao.get(roleId);
          const permissions = await rolePermissionsDao.getAllPermissions(
            roleId
          );

          return {
            id: roleId,
            name,
            permissions,
          };
        })
      );
    }) as IFieldResolver<IUser, TContext, unknown, Promise<IGraphqlRole[]>>,
  },
} as TGraphqlResolver;
