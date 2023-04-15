import { gql } from "apollo-server-core";
import { TContext } from "../../context";
import { verifyAuthorizedUser } from "../../controllers/auth/authorized";
import { fetchAssetsForUserInExactCollection } from "../../controllers/opensea/assets";
import { fetchCollectionByContractAddress } from "../../controllers/opensea/collection";
import {
  MutationResolvers,
  QueryResolvers,
  Resolvers,
} from "../../resolvers.generated";

export const typeSchema = gql`
  type OpenSeaAssetPagination {
    cursor: String
    page: Int!
    assets: [OpenSeaAsset!]!
  }

  type OpenSeaAsset {
    id: ID!
    tokenId: String!
    name: String
    imageUrl: String
    imageUrlOriginal: String
    thumbnailUrl: String
    externalUrl: String
    lastSale: String
    collection: OpenSeaCollection!
    assetContract: OpenSeaContract!
    topOwnerships: [OpenSeaOwnership!]!
    rarityData: OpenSeaRarityData
  }

  type OpenSeaTraits {
    traitType: String
    value: OpenSeaTraitValue
    displayType: String
  }

  type OpenSeaTraitValue {
    stringValue: String
    intValue: Int
    floatValue: Float
  }

  type OpenSeaContract {
    id: ID!
    address: String!
    assetContractType: String
    chainIdentifier: String!
    name: String
  }

  type OpenSeaOwnership {
    address: ID!
    user: String
    isVerified: Boolean
    isModerator: Boolean
  }

  type OpenSeaRarityData {
    strategyId: String!
    strategyVersion: String!
    rank: Int
    score: Float
    calculatedAt: Int
    maxRank: Int
    tokensScored: Int
    uniqueAttributeCount: Int
  }
`;

export const queryResolvers: QueryResolvers<TContext> = {
  assetsForUserInExactCollection: async (
    _,
    {
      address,
      collectionSlug,
      contractAddress,
      testnet,
      cursor,
      page,
      pageSize,
    },
    context
  ) => {
    await verifyAuthorizedUser(context);
    let offset = page ?? cursor ? parseInt(cursor) : 0;
    const limit = pageSize ?? 20;
    const assets = await fetchAssetsForUserInExactCollection({
      context,
      userAddress: address,
      contractSlug: collectionSlug,
      contractAddress,
      testnet,
      offset,
      limit,
    });

    if (assets.assets?.length > 0) {
      return {
        ...assets,
        cursor: (offset * limit + assets.assets.length).toString(),
        page: Math.floor(offset / limit) + 1,
      };
    }
    return {
      cursor: null,
      page: Math.floor(offset / limit) + 1,
      assets: [],
    };
  },
};

export const resolvers: Resolvers<TContext> = {
  OpenSeaAsset: {
    externalUrl: (asset) => {
      return asset.external_link;
    },
    imageUrl: (asset) => {
      return asset.image_url;
    },
    imageUrlOriginal: (asset) => {
      return asset.image_original_url;
    },
    thumbnailUrl: (asset) => {
      return asset.image_thumbnail_url;
    },
    lastSale: (asset) => {
      return asset.last_sale?.total_price ?? null;
    },
    rarityData: async (asset) => {
      return asset.rarity_data;
    },
    tokenId: (asset) => {
      return asset.token_id;
    },
  },
  OpenSeaRarityData: {
    maxRank: (rarityData) => {
      return rarityData.max_rank;
    },
    tokensScored: (rarityData) => {
      return rarityData.tokens_scored;
    },
    uniqueAttributeCount: (rarityData) => {
      return rarityData.ranking_features?.unique_attribute_count ?? 0;
    },
    calculatedAt: (rarityData) => {
      return rarityData.calculated_at
        ? new Date(rarityData.calculated_at).getTime()
        : null;
    },
    rank: (rarityData) => {
      return rarityData.rank;
    },
    score: (rarityData) => {
      return rarityData.score;
    },
    strategyId: (rarityData) => {
      return rarityData.strategy_id;
    },
    strategyVersion: (rarityData) => {
      return rarityData.strategy_version;
    },
  },
};
