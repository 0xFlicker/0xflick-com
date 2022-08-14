import { IFieldResolver } from "@graphql-tools/utils";
import { IUser } from "@0xflick/models";
import { TContext } from "../../context";
import { TGraphqlResolver } from "../../types";
import { IGraphqlRole, IGraphqlPermission } from "../admin/roles";

export interface IGraphqlWeb3User {
  address: string;
  nonce: number;
  roles: IGraphqlRole[];
  allowedActions: IGraphqlPermission[];
}

export const resolvers = {
  Web3User: {
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
