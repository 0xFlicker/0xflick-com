import { gql } from "apollo-server-core";
import { EActions, EResource } from "@0xflick/models";

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

  type Web3User {
    address: ID!
    nonce: Int!
    roles: [Role!]!
    allowedActions: [Permission!]!
  }

  type Web3LoginUser {
    address: ID!
    user: Web3User!
    token: String!
  }
`;

export interface IGraphqlPermission {
  action: EActions;
  resource: EResource;
}

export interface IGraphqlRole {
  id: string;
  name: string;
  permissions: IGraphqlPermission[];
}
