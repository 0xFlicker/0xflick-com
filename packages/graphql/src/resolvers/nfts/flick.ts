import { IFieldResolver } from "@graphql-tools/utils";
import { providers } from "ethers";
import { createLogger, defaultProviderUrl } from "@0xflick/backend";
import { INfts } from "@0xflick/models";
import { EnsError } from "../../errors/ens";
import { flickEnsDomain, nftCollectionsOfInterest } from "../../utils/config";
import { getEnumerableNftTokens, Nft } from "./common";
import { TContext } from "../../context";

const logger = createLogger({
  name: "graphql/resolvers/nfts/flick",
});

async function flickAddress(provider: providers.JsonRpcProvider) {
  return await provider.resolveName(flickEnsDomain);
}
export const resolveFlick: IFieldResolver<
  { nfts: Nft[] },
  TContext,
  void,
  Promise<{ nfts: Nft[] }>
> = async (_, __, context) => {
  const { defaultProvider: provider, ensProvider } = context;
  let myAddress: string;
  try {
    myAddress = await flickAddress(ensProvider);
  } catch (err: any) {
    logger.error(`Could not resolve flick address: ${err.code}`, err);
    throw new EnsError(err.reason, "UNABLE_TO_RESOLVE_ENS", err.code);
  }
  if (!myAddress) {
    throw new EnsError("ENS resolved to null", "ETH_NOT_FOUND");
  }
  logger.debug(`Resolved ENS to ${myAddress}`);
  const nfts = await Promise.all(
    nftCollectionsOfInterest.map((collection) =>
      getEnumerableNftTokens(
        logger,
        myAddress,
        collection.address,
        provider,
        collection.isEnumerable
      )
    )
  );
  return { nfts };
};
