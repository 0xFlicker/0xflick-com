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
import {
  typeSchema as typeSchemaOpenSea,
  queryResolvers as queryResolversOpenSea,
  resolvers as resolversOpenSea,
} from "./opensea";
import {
  typeSchema as typeSchemaPresale,
  mutationResolver as mutationResolverPresale,
} from "./presale";
import {
  typeSchema as typeSchemaAffiliate,
  mutationResolvers as mutationResolversAffiliate,
  queryResolvers as queryResolversAffiliate,
  resolvers as resolversAffiliate,
} from "./affiliates";
import { Resolvers } from "../resolvers.generated";
import { TContext } from "../context";
import { createLogger } from "@0xflick/backend";

const logger = createLogger({
  name: "graphql",
});

export const typeDefs = gql`
  ${typeSchemaNameflick}
  ${typeSchemaChain}
  ${typeSchemaAuth}
  ${typeSchemaAdmin}
  ${typeSchemaNfts}
  ${typeSchemaPresale}
  ${typeSchemaAffiliate}
  ${typeSchemaOpenSea}

  type Query {
    nameflickByFqdn(fqdn: ID!): Nameflick
    nameflickByEnsHash(ensHash: String!): Nameflick
    nameflicksByRootDomain(rootDomain: String!): [Nameflick!]!
    chain(id: ID!): ChainQuery!
    self: Web3User
    user(address: ID!): Web3User
    role(id: ID!): Role!
    roles: [Role!]!
    affiliateForAddress(address: String!): AffiliateQuery!
    openSeaCollectionByAddress(
      address: String!
      testnet: Boolean
    ): OpenSeaCollection
    assetsForUserInExactCollection(
      address: String!
      collectionSlug: String!
      contractAddress: String!
      testnet: Boolean
      cursor: String
      page: Int
      pageSize: Int
    ): OpenSeaAssetPagination!
    nftMetadataJobsForUser(address: String!): [NftMetadataFetchJob!]!
    nftMetadataJob(id: ID!): NftMetadataFetchJob!
  }

  type Mutation {
    createOrUpdatePublicNameflick(
      domain: ID!
      ttl: Int
      fields: NameflickFieldsInput!
    ): Nameflick!
    deletePublicNameflick(domain: ID!): Boolean!
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
    user(address: ID!): Web3User
    requestPresaleApproval(affiliate: String): PresaleApprovalResponse!
    affiliateForAddress(address: String!): AffiliateMutation!
    createAffiliate(address: String!): AffiliateMutation!
    startNftMetadataUpdate(
      contractAddress: String!
      chainId: Int!
      tokenIds: [String!]
      tokenIdStart: Int
      tokenIdEnd: Int
    ): NftMetadataFetchJob!
    nftMetadataJobsForUser(address: String!): [NftMetadataFetchJob!]!
    nftMetadataJob(id: ID!): NftMetadataFetchJob!
  }
`;

export const resolvers: Resolvers<TContext> = {
  Query: {
    ...queryResolversNameflick,
    ...queryResolversChain,
    ...queryResolversAuth,
    ...queryResolversAdmin,
    ...queryResolversAffiliate,
    ...queryResolversOpenSea,
  },
  Mutation: {
    ...mutationResolversNameflick,
    ...mutationResolversAuth,
    ...mutationResolvesAdmin,
    ...mutationResolverPresale,
    ...mutationResolversAffiliate,
  },
  ...resolversNfts,
  ...resolversAuth,
  ...resolversAdmin,
  ...resolversAffiliate,
  ...resolversOpenSea,
};
