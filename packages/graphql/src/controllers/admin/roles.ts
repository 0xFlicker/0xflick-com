import { v4 as createUuid } from "uuid";
import {
  defaultAdminStrategyAll,
  EActions,
  EResource,
  isActionOnResource,
} from "@0xflick/models";
import { TContext } from "../../context";
import { IGraphqlPermission } from "../../resolvers/admin/roles";
import { verifyAuthorizedUser } from "../auth/authorized";
import { GraphQLResolveInfo } from "graphql";
import { MutationError } from "../../errors/mutation";

const canPerformBindRoleToUserAction = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.USER_ROLE,
  }),
  isActionOnResource({
    action: EActions.UPDATE,
    resource: EResource.USER_ROLE,
  })
);

export async function bindUserToRole(
  context: TContext,
  info: GraphQLResolveInfo,
  {
    userAddress,
    roleId,
  }: {
    userAddress: string;
    roleId: string;
  }
) {
  context.requireMutation(info);
  await verifyAuthorizedUser(context, canPerformBindRoleToUserAction);
  const { userDao, userRolesDao, rolesDao } = context;
  const userFromDb = await userDao.getUser(userAddress);
  const userModel =
    userFromDb ??
    (await userDao.create({
      address: userAddress,
    }));

  await userRolesDao.bind({
    address: userAddress,
    roleId: roleId,
    rolesDao,
  });
  return userModel;
}

const canPerformCreateRoleAction = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.ROLE,
  })
);

export async function createRole(
  context: TContext,
  info: GraphQLResolveInfo,
  { name, permissions }: { name: string; permissions: IGraphqlPermission[] }
) {
  context.requireMutation(info);
  await verifyAuthorizedUser(context, canPerformCreateRoleAction);
  const { rolesDao, rolePermissionsDao } = context;
  const id = createUuid();
  await rolesDao.create({
    id,
    name,
  });
  await Promise.all(
    permissions.map(async (permission) => {
      await rolePermissionsDao.bind({
        roleId: id,
        ...permission,
      });
    })
  );
  return {
    id,
    name,
    permissions,
  };
}
