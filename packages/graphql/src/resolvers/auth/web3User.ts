import { gql } from "apollo-server-core";
import { IFieldResolver } from "@graphql-tools/utils";
import { IUser } from "@0xflick/models";

import { TContext } from "../../context";
import { bindUserToRole } from "../../controllers/admin/roles";
import { authorizedUser } from "../../controllers/auth/user";
import { Resolvers } from "../../resolvers.generated";
import { isTwitterFollowing } from "../../controllers/twitter/isFollowing";
import { RoleModel } from "../../models";

export const typeSchema = gql`
  type Web3User {
    address: ID!
    nonce: Int!
    roles: [Role!]!
    allowedActions: [Permission!]!
    bindToRole(roleId: String!): Web3User!
    isTwitterFollower: Boolean!
  }

  type Web3LoginUser {
    address: ID!
    user: Web3User!
    token: String!
  }
`;

const selfResolver: IFieldResolver<
  unknown,
  TContext,
  unknown,
  Promise<IUser>
> = async (_, __, context) => {
  return await authorizedUser(context);
};

export const queryResolvers: Resolvers<TContext>["Query"] = {
  self: selfResolver,
};

export const mutationResolvers: Resolvers<TContext>["Mutation"] = {
  self: selfResolver,
};

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

export const resolvers: Resolvers<TContext> = {
  Web3User: {
    bindToRole: roleBindToUserResolver,
    allowedActions: async (
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
    },
    roles: async (
      user,
      _,
      { rolePermissionsDao, rolesDao, userDao, userRolesDao }
    ) => {
      const userRoles = await userDao.getUserWithRoles(
        userRolesDao,
        user.address
      );
      return userRoles.roleIds.map(
        (roleId) => new RoleModel(rolesDao, rolePermissionsDao, roleId)
      );
    },
    isTwitterFollower: async (user, _, context) => {
      return await isTwitterFollowing(context, user);
    },
  },
};
