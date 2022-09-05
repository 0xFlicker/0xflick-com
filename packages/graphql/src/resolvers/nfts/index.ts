import { gql } from "apollo-server-core";
import { TContext } from "../../context";
import { Resolvers } from "../../resolvers.generated";
import { resolveFlick } from "./flick";
import { resolveImage, resolveNftTokenImage } from "./token";

export const typeSchema = gql`
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
`;

export const resolvers: Resolvers<TContext> = {
  NftToken: {
    image: resolveNftTokenImage,
  },
  ChainQuery: {
    flick: resolveFlick,
    image: resolveImage,
  },
};
