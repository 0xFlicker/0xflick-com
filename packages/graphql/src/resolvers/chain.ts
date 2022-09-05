import { gql } from "apollo-server-core";
import { IFieldResolver } from "@graphql-tools/utils";
import { TContext } from "../context";
import { ChainError } from "../errors/chain";
import { ChainQuery, Resolvers } from "../resolvers.generated";

export const typeSchema = gql`
  type ChainQuery {
    chainId: String!
    chainName: String!
    ensRegistry: String
    flick: Flick
    image(contract: String!, tokenId: Int!, width: Int, height: Int): String
  }
`;

const chainResolver: IFieldResolver<
  unknown,
  TContext,
  { id: string },
  Promise<ChainQuery>
> = async (_, { id }, { config }) => {
  try {
    const chainId = parseInt(id, 10);
    const chain = config.chains[chainId];
    if (!chain) {
      throw new ChainError("Chain not found", "INVALID_CHAIN_ID", chainId);
    }
    return {
      chainId: chainId.toString(),
      chainName: chain.name,
      ensRegistry: chain.ens ? chain.ens.registry : undefined,
    };
  } catch (err) {
    throw new ChainError("ChainID not a number", "INVALID_CHAIN_ID", id);
  }
};

export const queryResolvers: Resolvers["Query"] = {
  chain: chainResolver,
};
