import { NextApiRequest, NextApiResponse } from "next";
import { nftCollectionsOfInterest, flickEnsDomain } from "utils/config";
import type { IMetadata } from "@0xflick/models";
import {
  IERC721Enumerable__factory,
  IERC721AQueryable__factory,
  IERC721Metadata__factory,
} from "@0xflick/contracts";

import { BigNumber, providers } from "ethers";
import fetch from "isomorphic-unfetch";

if (!process.env.WEB3_RPC) {
  throw new Error("WEB3_RPC is not set");
}
const WEB3_RPC = process.env.WEB3_RPC;

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
          resizedImage = `${NEXT_PUBLIC_IMAGE_RESIZER}/ipfs/${metadata.image.substring(
            7
          )}`;
        }
        return {
          tokenId: tokenId.toNumber(),
          metadata: metadata,
          resizedImage,
        };
      });
  if (enumerable) {
    for (let i = 0; i < nftTokens; i++) {
      tokenUris.push(
        contractEnumerable.tokenOfOwnerByIndex(myAddress, i).then(imageFetcher)
      );
    }
    return Promise.all(tokenUris).then((tokenUris) => ({
      collectionName: collectionName,
      ownedTokens: tokenUris,
    }));
  } else {
    return erc721aEnumerable
      .tokensOfOwner(myAddress)
      .then((tokenIds) => {
        return Promise.all(tokenIds.map(imageFetcher));
      })
      .then((tokenUris) => ({
        collectionName: collectionName,
        ownedTokens: tokenUris,
      }));
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const provider = new providers.JsonRpcProvider(WEB3_RPC);
  const myAddress = await flickAddress(provider);
  if (!myAddress) {
    res.status(500).send("Could not get your address");
    return;
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
  res.status(200).json(nfts);
}
