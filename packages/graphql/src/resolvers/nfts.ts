import { createLogger } from "@0xflick/backend";
import { jsonRpcProvider } from "../utils/providers";
import { nftCollectionsOfInterest, flickEnsDomain } from "../utils/config";
import type { IMetadata } from "../utils/metadata";
import {
  IERC721Metadata__factory,
  IERC721Enumerable__factory,
  IERC721AQueryable__factory,
} from "@0xflick/contracts";

import { BigNumber, providers } from "ethers";
import fetch from "isomorphic-unfetch";
import { defaultProviderUrl } from "@0xflick/backend";
import { EnsError } from "../errors/ens";
import { MetadataError } from "../errors/metadata";
import { ContractError } from "../errors/contract";

if (!process.env.NEXT_PUBLIC_IMAGE_RESIZER) {
  throw new Error("NEXT_PUBLIC_IMAGE_RESIZER is not set");
}
const NEXT_PUBLIC_IMAGE_RESIZER = process.env.NEXT_PUBLIC_IMAGE_RESIZER;

if (!process.env.NEXT_PUBLIC_IPFS) {
  throw new Error("NEXT_PUBLIC_IPFS is not set");
}
const NEXT_PUBLIC_IPFS = process.env.NEXT_PUBLIC_IPFS;

async function flickAddress(provider: providers.JsonRpcProvider) {
  return await provider.resolveName(flickEnsDomain);
}

const logger = createLogger({
  name: "0xflick/graphql/resolvers/nfts",
});

interface Nft {
  collectionName: string;
  ownedTokens: {
    tokenId: number;
    metadata: IMetadata;
    resizedImage: string;
  }[];
}

async function getEnumerableNftTokens(
  myAddress: string,
  contractAddress: string,
  provider: providers.JsonRpcProvider,
  enumerable: boolean
): Promise<Nft> {
  const contractEnumerable = IERC721Enumerable__factory.connect(
    contractAddress,
    provider
  );
  const contractMetadata = IERC721Metadata__factory.connect(
    contractAddress,
    provider
  );
  const nftTokens = (await contractEnumerable.balanceOf(myAddress)).toNumber();
  const tokenUris: Promise<{
    tokenId: number;
    metadata: IMetadata;
    resizedImage: string;
  }>[] = [];
  const erc721aEnumerable = IERC721AQueryable__factory.connect(
    contractAddress,
    provider
  );
  const collectionName = await contractMetadata.name();
  const imageFetcher = (tokenId: BigNumber) =>
    contractMetadata
      .tokenURI(tokenId)
      .then(async (metadataUrl) => {
        if (metadataUrl.startsWith("ipfs://")) {
          const response = await fetch(
            `${NEXT_PUBLIC_IPFS}/${metadataUrl.substring(7)}`
          );
          const metadata = await response.json();
          return metadata as IMetadata;
        }
        const response = await fetch(metadataUrl);
        return (await response.json()) as IMetadata;
      })
      .then((metadata) => {
        let resizedImage = metadata.image;
        if (metadata.image.startsWith("ipfs://")) {
          resizedImage = `${NEXT_PUBLIC_IMAGE_RESIZER}/${metadata.image.substring(
            7
          )}`;
        }
        return {
          tokenId: tokenId.toNumber(),
          metadata: metadata,
          resizedImage,
        };
      })
      .catch((err) => {
        logger.error(err);
        throw new MetadataError(err.message, "METADATA_FETCH_ERROR", err.code);
      });
  if (enumerable) {
    for (let i = 0; i < nftTokens; i++) {
      tokenUris.push(
        contractEnumerable
          .tokenOfOwnerByIndex(myAddress, i)
          .then(imageFetcher)
          .catch((err) => {
            if (err instanceof MetadataError) {
              throw err;
            }
            logger.error(err);
            throw new ContractError(
              err.reason,
              "ERROR_CONTRACT_REVERTED_DURING_READ",
              err.code
            );
          })
      );
    }
    return Promise.all(tokenUris).then((tokenUris) => ({
      collectionName: collectionName,
      ownedTokens: tokenUris,
    }));
  } else {
    return erc721aEnumerable
      .tokensOfOwner(myAddress)
      .catch((err) => {
        logger.error(err);
        throw new ContractError(
          err.reason,
          "ERROR_CONTRACT_REVERTED_DURING_READ",
          err.code
        );
      })
      .then((tokenIds) => {
        return Promise.all(tokenIds.map(imageFetcher));
      })
      .then((tokenUris) => ({
        collectionName: collectionName,
        ownedTokens: tokenUris,
      }));
  }
}

export async function get() {
  const provider = jsonRpcProvider(defaultProviderUrl());
  let myAddress: string;
  try {
    myAddress = await flickAddress(provider);
  } catch (err: any) {
    throw new EnsError(err.reason, "UNABLE_TO_RESOLVE_ENS", err.code);
  }
  if (!myAddress) {
    throw new EnsError("ENS resolved to null", "ETH_NOT_FOUND");
  }
  const nfts = await Promise.all(
    nftCollectionsOfInterest.map((collection) =>
      getEnumerableNftTokens(
        myAddress,
        collection.address,
        provider,
        collection.isEnumerable
      )
    )
  );
  return nfts;
}
