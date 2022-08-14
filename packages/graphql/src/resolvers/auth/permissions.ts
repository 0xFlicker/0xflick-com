import { gql } from "apollo-server-core";

export const typeSchema = gql`
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
