import { gql } from "apollo-server-core";
import { resolveFlick, resolveImage, resolveNftTokenImage } from "./nfts";
import {
  typeSchema as typeSchemaAuth,
  resolvers as resolversAuth,
  mutationSchema as mutationSchemaAuth,
  mutationResolvers as mutationResolversAuth,
  queryResolvers as queryResolversAuth,
  querySchema as querySchemaAuth,
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
  resolvers as resolversAdmin,
} from "./admin";
import {
  typeSchema as typeSchemaNameflick,
  querySchema as querySchemaNameflick,
  mutationResolvers as mutationResolversNameflick,
  mutationSchema as mutationSchemaNameflick,
  queryResolvers as queryResolversNameflick,
  resolvers as resolversNameflick,
} from "./nameflick";
import { TGraphqlResolver } from "../types";

export const typeDefs = gql`
  ${typeSchemaNameflick}
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
    ${querySchemaNameflick}
    ${querySchemaChain}
    ${querySchemaAuth}
    ${querySchemaAdmin}
  }

  type Mutation {
    ${mutationSchemaNameflick}
    ${mutationSchemaAuth}
    ${mutationSchemaAdmin}
  }
`;

export const resolvers = {
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
  NftToken: {
    image: resolveNftTokenImage,
  },
  ...resolversChain,
  ...resolversAuth,
  ...resolversAdmin,
  ...resolversNameflick,
} as TGraphqlResolver;
