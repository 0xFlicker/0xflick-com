import { gql } from "apollo-server-core";
import { resolveFlick, resolveImage, resolveNftTokenImage } from "./nfts";
import {
  typeSchema as typeSchemaAuth,
  resolvers as resolversAuth,
  mutationSchema as mutationSchemaAuth,
  mutations as mutationsAuth,
} from "./auth";
import {
  typeSchema as typeSchemaChain,
  querySchema as querySchemaChain,
  resolvers as resolversChain,
  queryResolvers as queryResolversChain,
} from "./chain";
import {
  typeSchema as typeSchemaAdmin,
  mutationSchema as mutationSchemaAdmin,
  mutationResolves as mutationResolvesAdmin,
  querySchema as querySchemaAdmin,
  queryResolvers as queryResolversAdmin,
} from "./admin";
import { TGraphqlResolver } from "../types";

export const typeDefs = gql`
  ${typeSchemaChain}
  ${typeSchemaAuth}
  ${typeSchemaAdmin}
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
    ${querySchemaChain}
    ${querySchemaAdmin}
  }

  type Mutation {
    ${mutationSchemaAuth}
    ${mutationSchemaAdmin}
  }
`;

export const resolvers = {
  Query: {
    ...queryResolversChain,
    ...queryResolversAdmin,
  },
  Mutation: {
    ...mutationsAuth,
    ...mutationResolvesAdmin,
  },
  NftToken: {
    image: resolveNftTokenImage,
  },
  ...resolversAuth,
  ...resolversChain,
} as TGraphqlResolver;
