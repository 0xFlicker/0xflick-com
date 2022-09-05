import { IFieldResolver } from "@graphql-tools/utils";
import { providers } from "ethers";
import { createLogger } from "@0xflick/backend";
import { EnsError } from "../../errors/ens";
import { flickEnsDomain, nftCollectionsOfInterest } from "../../utils/config";
import { getEnumerableNftTokens } from "./common";
import { TContext } from "../../context";
import { ChainQuery, Flick } from "../../resolvers.generated";

const logger = createLogger({
  name: "graphql/resolvers/nfts/flick",
});

async function flickAddress(provider: providers.JsonRpcProvider) {
  return await provider.resolveName(flickEnsDomain.get());
}
export const resolveFlick: IFieldResolver<
  ChainQuery,
  TContext,
  unknown,
  Promise<Flick>
> = async ({ chainId }, __, context) => {
  const { providerForChain } = context;
  const provider = providerForChain(Number(chainId));
  let myAddress: string;
  try {
    myAddress = await flickAddress(provider);
  } catch (err: any) {
    logger.error(`Could not resolve flick address: ${err.code}`, err);
    throw new EnsError(err.reason, "UNABLE_TO_RESOLVE_ENS", err.code);
  }
  if (!myAddress) {
    throw new EnsError("ENS resolved to null", "ETH_NOT_FOUND");
  }
  logger.debug(`Resolved ENS to ${myAddress}`);
  const nfts = await Promise.all(
    nftCollectionsOfInterest.get().map((collection) => ({
      ...getEnumerableNftTokens(
        logger,
        myAddress,
        collection.address,
        provider,
        collection.isEnumerable
      ),
      id: collection.address,
    }))
  );
  return { nfts };
};
