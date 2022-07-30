import { gql } from "apollo-server-core";
import { IResolvers } from "@graphql-tools/utils";
import { resolveFlick, resolveImage, resolveNftTokenImage } from "./nfts";
import { TContext } from "../context";

export const typeDefs = gql`
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
  }
`;

export const resolvers = {
  Query: {
    flick: resolveFlick,
    image: resolveImage,
  },
  NftToken: {
    image: resolveNftTokenImage,
  },
} as IResolvers<any, TContext, Record<string, any>, any>;
