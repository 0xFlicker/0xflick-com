import { gql } from "apollo-server-core";
import {
  resolvers as resolversNfts,
  typeSchema as typeSchemaNfts,
} from "./nfts";
import {
  typeSchema as typeSchemaAuth,
  resolvers as resolversAuth,
  mutationResolvers as mutationResolversAuth,
  queryResolvers as queryResolversAuth,
} from "./auth";
import {
  typeSchema as typeSchemaChain,
  queryResolvers as queryResolversChain,
} from "./chain";
import {
  typeSchema as typeSchemaAdmin,
  mutationResolves as mutationResolvesAdmin,
  queryResolvers as queryResolversAdmin,
  resolvers as resolversAdmin,
} from "./admin";
import {
  typeSchema as typeSchemaNameflick,
  mutationResolvers as mutationResolversNameflick,
  queryResolvers as queryResolversNameflick,
} from "./nameflick";
import { Resolvers } from "../resolvers.generated";
import { TContext } from "../context";

export const typeDefs = gql`
  ${typeSchemaNameflick}
  ${typeSchemaChain}
  ${typeSchemaAuth}
  ${typeSchemaAdmin}
  ${typeSchemaNfts}

  type Query {
    nameflickByFqdn(fqdn: ID!): Nameflick
    nameflickByEnsHash(ensHash: String!): Nameflick
    nameflicksByRootDomain(rootDomain: String!): [Nameflick!]!
    chain(id: ID!): ChainQuery!
    self: Web3User
    role(id: ID!): Role!
    roles: [Role!]!
  }

  type Mutation {
    createOrUpdateNameflick(
      domain: ID!
      ttl: Int
      fields: NameflickFieldsInput!
    ): Nameflick!
    deleteNameflick(domain: ID!): Boolean!
    role(id: ID!): Role!
    roles: [Role!]!
    createRole(name: String!, permissions: [PermissionInput!]!): Role!
    nonceForAddress(address: String!): Nonce
    signIn(
      address: String!
      jwe: String!
      issuedAt: String!
      chainId: Int!
    ): Web3LoginUser
    signOut: Boolean!
    self: Web3User
  }
`;

export const resolvers: Resolvers<TContext> = {
  Query: {
    ...queryResolversNameflick,
    ...queryResolversChain,
    ...queryResolversAuth,
    ...queryResolversAdmin,
  },
  Mutation: {
    ...mutationResolversNameflick,
    ...mutationResolversAuth,
    ...mutationResolvesAdmin,
  },
  ...resolversNfts,
  ...resolversAuth,
  ...resolversAdmin,
};
