import { gql } from "apollo-server-core";
import { resolveFlick, resolveImage, resolveNftTokenImage } from "./nfts";
import {
  typeSchema as typeSchemaAuth,
  queries as queriesAuth,
  querySchema as querySchemaAuth,
  resolvers as resolversAuth,
  mutationSchema as mutationSchemaAuth,
  mutations as mutationsAuth,
} from "./auth";
import { TGraphqlResolver } from "../types";

export const typeDefs = gql`
  ${typeSchemaAuth}
  type MetadataProperties {
    name: String!
    value: String!
  }
  type MetadataAttributeString {
    value: String!
    trait_type: String!
    colors: [String!]
  }
  type MetadataAttributeNumeric {
    value: Float!
    trait_type: String
    display_type: String
  }
  union MetadataAttribute = MetadataAttributeString | MetadataAttributeNumeric
  type Metadata {
    image: String
    description: String
    tokenId: String!
    id: String!
    externalUrl: String
    name: String
    attributes: [MetadataAttribute!]
    properties: [MetadataProperties!]
    edition: String
  }
  type NftToken {
    id: ID!
    tokenId: String!
    image(width: Int, height: Int): String
    metadata: Metadata
  }
  type Nft {
    collectionName: String!
    contractAddress: String!
    ownedTokens: [NftToken!]!
  }

  type Flick {
    nfts: [Nft!]
  }

  type Query {
    flick: Flick
    image(contract: String!, tokenId: Int!, width: Int, height: Int): String
    ${querySchemaAuth}
  }

  type Mutation {
    ${mutationSchemaAuth}
  }
`;

export const resolvers = {
  Query: {
    flick: resolveFlick,
    image: resolveImage,
    ...queriesAuth,
  },
  Mutation: {
    ...mutationsAuth,
  },
  NftToken: {
    image: resolveNftTokenImage,
  },
  ...resolversAuth,
} as TGraphqlResolver;
