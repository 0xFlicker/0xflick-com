import { gql } from "apollo-server-core";
import {
  defaultAdminStrategyAll,
  EActions,
  EResource,
  isActionOnResource,
  IUser,
  verifyJwtToken,
} from "@0xflick/models";
import { IFieldResolver } from "@graphql-tools/utils";
import { TContext } from "../../context";
import { RoleError } from "../../errors/roles";
import { bindUserToRole, createRole } from "../../controllers/admin/roles";
import { OperationTypeNode } from "graphql";

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

  input PermissionInput {
    action: PermissionAction!
    resource: PermissionResource!
  }

  type Role {
    id: ID!
    name: String!
    permissions: [Permission!]!
    bindToUser(userAddress: String!): Web3User!
  }
`;

export const querySchema = `
  role(id: ID!): Role!
`;

export const mutationSchema = `
  role(id: ID!): Role!
  createRole(name: String!, permissions: [PermissionInput!]!): Role!
  bindRoleToUser(roleId: ID!, userAddress: ID!): Boolean!
`;

const roleBindToUserResolver: IFieldResolver<
  IGraphqlRole,
  TContext,
  { userAddress: string },
  Promise<IUser>
> = async ({ id: roleId }, { userAddress }, context, info) => {
  return await bindUserToRole(context, info, {
    userAddress,
    roleId,
  });
};

export const resolvers = {
  Role: {
    bindToUser: roleBindToUserResolver,
  },
};

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

const createRoleResolver: IFieldResolver<
  void,
  TContext,
  { name: string; permissions: IGraphqlPermission[] },
  Promise<IGraphqlRole>
> = async (_, { name, permissions }, context, info) => {
  return await createRole(context, info, {
    name,
    permissions,
  });
};

const bindRoleToUserResolver: IFieldResolver<
  void,
  TContext,
  { roleId: string; userAddress: string },
  Promise<IUser>
> = async (_, { roleId, userAddress }, context, info) => {
  return await bindUserToRole(context, info, {
    userAddress,
    roleId,
  });
};

export const mutationResolvers = {
  role: roleResolver,
  createRole: createRoleResolver,
  bindRoleToUser: bindRoleToUserResolver,
};
