import {
  allowAdminAll,
  allowAdminOnResource,
  EMetadataJobStatus,
  EResource,
  oneOf,
  or,
} from "@0xflick/models";
import { v4 as uuidv4 } from "uuid";
import { gql } from "apollo-server-core";
import { TContext } from "../../context";
import { verifyAuthorizedUser } from "../../controllers/auth/authorized";
import {
  EMetadataFetchEventDetailType,
  emitMetadataEvent,
} from "../../controllers/metadata/bus";
import {
  createJob,
  getJob,
  listJobsByAddress,
} from "../../controllers/metadata/job";
import { Resolvers } from "../../resolvers.generated";
import { resolveFlick } from "./flick";
import { resolveImage, resolveNftTokenImage } from "./token";
import { Web3Error } from "../../errors/web3";
import { utils } from "ethers";

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

  enum NftMetadataFetchJobStatus {
    PENDING
    IN_PROGRESS
    COMPLETE
    FAILED
    STOPPED
  }
  type NftMetadataFetchJob {
    jobId: ID!
    status: NftMetadataFetchJobStatus!
    progress: Float!
    contractAddress: String!
    chainId: Int!
    createdAt: Int!
    updatedAt: Int!

    stop: NftMetadataFetchJob!
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
  NftMetadataFetchJob: {
    createdAt: (parent) => parent.createdAt.getTime(),
    updatedAt: (parent) => parent.updatedAt.getTime(),
    stop: async (parent, args, context) => {
      const event = await emitMetadataEvent({
        DetailType: EMetadataFetchEventDetailType.STOP,
        Detail: {
          jobId: parent.jobId,
        },
      });
      return {
        ...parent,
        status: EMetadataJobStatus.STOPPED,
      };
    },
  },
};

const nftMetadataAdmin = oneOf(
  or(allowAdminOnResource(EResource.NFT_METADATA_JOB), allowAdminAll)
);

const commonResolvers:
  | Resolvers<TContext>["Query"]
  | Resolvers<TContext>["Mutation"] = {
  nftMetadataJob: async (_, { id }, context) => {
    return getJob(context, { id });
  },
  nftMetadataJobsForUser: async (_, { address }, context) => {
    await verifyAuthorizedUser(
      context,
      (permissions, user) =>
        user.address.toLowerCase() === address.toLowerCase() ||
        nftMetadataAdmin(permissions)
    );
    return listJobsByAddress(context, { address });
  },
};

export const queryResolvers: Resolvers<TContext>["Query"] = {
  ...commonResolvers,
};

export const mutationResolvers: Resolvers<TContext>["Mutation"] = {
  ...commonResolvers,
  startNftMetadataUpdate: async (
    _,
    { tokenIds, contractAddress, chainId, tokenIdEnd, tokenIdStart },
    context
  ) => {
    const user = await verifyAuthorizedUser(context);
    const jobId = uuidv4();
    if (!utils.isAddress(contractAddress)) {
      throw new Web3Error("Invalid contract address", "ERROR_ADDRESS_INVALID");
    }
    const validAddress = contractAddress as `0x{string}`;
    await Promise.all([
      createJob(context, {
        jobId,
        forAddress: user.address,
        contractAddress: validAddress,
        chainId,
      }),
      emitMetadataEvent({
        DetailType: EMetadataFetchEventDetailType.START,
        Detail: {
          jobId,
          contractAddress,
          tokenIds,
          chainId,
          tokenIdEnd,
          tokenIdStart,
        },
      }),
    ]);
    return getJob(context, { id: jobId });
  },
};
