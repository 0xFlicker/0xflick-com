import { gql } from "apollo-server-core";
import { EActions, EResource, IUser } from "@0xflick/models";
import { TContext } from "../../context";
import { RoleError } from "../../errors/roles";
import {
  bindUserToRole,
  createRole,
  deleteRole,
  listAllRoles,
  unlinkUserFromRole,
} from "../../controllers/admin/roles";
import { Resolvers } from "../../resolvers.generated";
import {
  graphqlPermissionToModel,
  modelPermissionActionToGraphql,
  modelPermissionResourceToGraphql,
} from "../../transforms/permissions";

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
    identifier: String
  }

  input PermissionInput {
    action: PermissionAction!
    resource: PermissionResource!
    identifier: String
  }

  type Role {
    id: ID!
    name: String!
    userCount: Int!
    permissions: [Permission!]!
    bindToUser(userAddress: String!): Web3User!
    unbindFromUser(userAddress: String!): Web3User!
    delete: Boolean!
  }
`;

export const resolvers: Resolvers<TContext> = {
  Permission: {
    action: (permission) => modelPermissionActionToGraphql(permission.action),
    resource: (permission) =>
      modelPermissionResourceToGraphql(permission.resource),
  },
  Role: {
    delete: async ({ id: roleId }, _, context, info) => {
      return await deleteRole(context, info, roleId);
    },
    bindToUser: async ({ id: roleId }, { userAddress }, context, info) => {
      const user = await bindUserToRole(context, info, {
        userAddress,
        roleId,
      });
      return user;
    },
    unbindFromUser: async ({ id: roleId }, { userAddress }, context, info) => {
      const result = await unlinkUserFromRole(context, info, {
        userAddress,
        roleId,
      });
      if (!result) {
        throw new RoleError(
          "Failed to unlink user from role",
          "UNABLE_TO_UNLINK_ROLE"
        );
      }
      return {
        address: userAddress,
        // We don't actually known the nonce of the user
        nonce: -1,
      };
    },
  },
};

export const queryResolvers: Resolvers<TContext>["Query"] = {
  roles: async (_, __, context) => {
    return await listAllRoles(context);
  },
  role: async (_, { id }, { rolesDao, rolePermissionsDao }) => {
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
  },
};

export const mutationResolvers: Resolvers<TContext>["Mutation"] = {
  role: queryResolvers.role,
  roles: async (_, __, context) => {
    return await listAllRoles(context);
  },
  createRole: async (_, { name, permissions }, context, info) => {
    return await createRole(context, info, {
      name,
      permissions: permissions.map(graphqlPermissionToModel),
    });
  },
};
