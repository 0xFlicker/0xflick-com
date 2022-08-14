import { gql } from "apollo-server-core";
import { resolveFlick, resolveImage } from "./nfts";
import { TGraphqlResolver } from "../types";
import { IFieldResolver } from "@graphql-tools/utils";
import { TContext } from "../context";
import { ChainError } from "../errors/chain";

export const typeSchema = gql`
  type ChainQuery {
    chainId: String!
    chainName: String!
    ensRegistry: String
    flick: Flick
    image(contract: String!, tokenId: Int!, width: Int, height: Int): String
  }
`;

export const querySchema = `
  chain(id: ID!): ChainQuery!
`;

export interface IChainContext {
  chainId: number;
  chainName: string;
  ensRegistry?: string;
}
const chainResolver: IFieldResolver<
  void,
  TContext,
  { id: string },
  Promise<IChainContext>
> = async (_, { id }, { config }) => {
  try {
    const chainId = parseInt(id, 10);
    const chain = config.chains[chainId];
    if (!chain) {
      throw new ChainError("Chain not found", "INVALID_CHAIN_ID", chainId);
    }
    return {
      chainId,
      chainName: chain.name,
      ensRegistry: chain.ens ? chain.ens.registry : undefined,
    };
  } catch (err) {
    throw new ChainError("ChainID not a number", "INVALID_CHAIN_ID", id);
  }
};

export const queryResolvers: TGraphqlResolver["Query"] = {
  chain: chainResolver,
};

export const resolvers = {
  ChainQuery: {
    flick: resolveFlick,
    image: resolveImage,
  },
};
