import { gql } from "apollo-server-core";
import { TContext } from "../../context";
import { verifyAuthorizedUser } from "../../controllers/auth/authorized";
import { fetchCollectionByContractAddress } from "../../controllers/opensea/collection";
import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
} from "../../resolvers.generated";

export const typeSchema = gql`
  enum OpenSeaSafelistRequestStatus {
    NOT_REQUESTED
    REQUESTED
    APPROVED
    VERIFIED
  }

  type OpenSeaCollection {
    id: ID!
    name: String!
    slug: String!
    externalUrl: String
    discordUrl: String
    telegramUrl: String
    twitterUsername: String
    instagramUsername: String
    description: String!
    imageUrl: String
    editors: [String!]!
  }
`;

export const queryResolvers: QueryResolvers<TContext> = {
  openSeaCollectionByAddress: async (_, { address }, context) => {
    await verifyAuthorizedUser(context);
    const asset = await fetchCollectionByContractAddress(context, address);
    return asset;
  },
};

export const resolvers: Resolvers<TContext> = {
  OpenSeaCollection: {
    id: (asset) => asset.address,
    name: (asset) => asset.name,
    slug: (asset) => asset.collection.slug,
    externalUrl: (asset) => asset.collection.external_url,
    discordUrl: (asset) => asset.collection.discord_url,
    telegramUrl: (asset) => asset.collection.telegram_url,
    twitterUsername: (asset) => asset.collection.twitter_username,
    instagramUsername: (asset) => asset.collection.instagram_username,
    description: (asset) => asset.description,
    imageUrl: (asset) => asset.image_url,
    editors: (asset) => asset.collection.editors ?? [],
  },
};
