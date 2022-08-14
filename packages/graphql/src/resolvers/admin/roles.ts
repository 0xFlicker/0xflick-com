import { gql } from "apollo-server-core";
import { v4 as createUuid } from "uuid";
import {
  defaultAdminStrategyAll,
  EActions,
  EResource,
  IRolePermission,
  isActionOnResource,
  verifyJwtToken,
} from "@0xflick/models";
import { IFieldResolver } from "@graphql-tools/utils";
import { TContext } from "../../context";
import { AuthError } from "../../errors/auth";
import { defaultChainId } from "@0xflick/backend";
import { RoleError } from "../../errors/roles";

export interface IGraphqlPermission {
  action: EActions;
  resource: EResource;
}

export interface IGraphqlRole {
  id: string;
  name: string;
  permissions: IGraphqlPermission[];
}

export const typeSchema = gql`
  enum PermissionAction {
    CREATE
    UPDATE
    DELETE
    LIST
    GET
    USE
    ADMIN
  }

  enum PermissionResource {
    ALL
    USER
    USER_ROLE
    ADMIN
    PRESALE
    FAUCET
    PERMISSION
    ROLE
  }

  type Permission {
    action: PermissionAction!
    resource: PermissionResource!
  }

  type Role {
    id: ID!
    name: String!
    permissions: [Permission!]!
  }
`;

export const querySchema = `
  role(id: ID!): Role!
`;

export const mutationSchema = `
  createRole(name: String!, permissions: [Permission!]!): Role!
  bindRoleToUser(roleId: ID!, address: ID!): Boolean!
`;

const roleResolver: IFieldResolver<
  void,
  TContext,
  { id: string },
  Promise<IGraphqlRole>
> = async (_, { id }, { rolesDao, rolePermissionsDao }) => {
  const role = await rolesDao.get(id);
  if (!role) {
    throw new RoleError(`Role with id ${id} not found`, "ROLE_NOT_FOUND");
  }
  const permissions = await rolePermissionsDao.getAllPermissions(role.id);
  return {
    id: role.id,
    name: role.name,
    permissions,
  };
};

export const queryResolvers = {
  role: roleResolver,
};

const canPerformCreateRoleAction = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.ROLE,
  })
);

const createRoleResolver: IFieldResolver<
  void,
  TContext,
  { name: string; permissions: IGraphqlPermission[] },
  Promise<IGraphqlRole>
> = async (
  _,
  { name, permissions },
  { config, rolesDao, rolePermissionsDao, getToken, ownerForChain }
) => {
  const token = getToken();
  if (!token) {
    throw new AuthError("Not authenticated", "NOT_AUTHENTICATED");
  }
  const user = await verifyJwtToken(token);
  if (!user) {
    throw new AuthError("Invalid token", "NOT_AUTHENTICATED");
  }

  const permissionsFromDb = await rolePermissionsDao.allowedActionsForRoleIds(
    user.roleIds
  );

  let isAuthorized = canPerformCreateRoleAction(permissionsFromDb);
  const contractOwner = await ownerForChain(Number(defaultChainId()));
  if (!isAuthorized && contractOwner === user.address) {
    isAuthorized = true;
  }
  if (!isAuthorized) {
    throw new AuthError("Forbidden", "NOT_AUTHORIZED");
  }
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
};

const canPerformBindRoleToUserAction = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.UPDATE,
    resource: EResource.ROLE,
  })
);
const bindRoleToUserResolver: IFieldResolver<
  void,
  TContext,
  { roleId: string; address: string },
  Promise<boolean>
> = async (
  _,
  { roleId, address },
  { config, userRolesDao, userDao, rolePermissionsDao, getToken, ownerForChain }
) => {
  const token = getToken();
  if (!token) {
    throw new AuthError("Not authenticated", "NOT_AUTHENTICATED");
  }
  const user = await verifyJwtToken(token);
  if (!user) {
    throw new AuthError("Invalid token", "NOT_AUTHENTICATED");
  }

  const permissionsFromDb = await rolePermissionsDao.allowedActionsForRoleIds(
    user.roleIds
  );

  let isAuthorized = canPerformBindRoleToUserAction(permissionsFromDb);
  const contractOwner = await ownerForChain(Number(defaultChainId()));
  if (!isAuthorized && contractOwner === user.address) {
    isAuthorized = true;
  }
  if (!isAuthorized) {
    throw new AuthError("Forbidden", "NOT_AUTHORIZED");
  }
  const userFromDb = await userDao.getUser(address);
  const userModel =
    userFromDb ??
    (await userDao.create({
      address,
    }));

  await userRolesDao.bind(userModel.address, roleId);

  return true;
};

export const mutationResolvers = {
  createRole: createRoleResolver,
  bindRoleToUser: bindRoleToUserResolver,
};
