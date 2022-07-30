import type { IMetadata, INfts } from "@0xflick/models";
import {
  IERC721Metadata__factory,
  IERC721Enumerable__factory,
  IERC721AQueryable__factory,
  IERC721Metadata,
} from "@0xflick/contracts";

import { BigNumber, providers } from "ethers";
import fetch from "isomorphic-unfetch";
import { MetadataError } from "../../errors/metadata";
import { ContractError } from "../../errors/contract";
import Logger from "bunyan";
import { resolveNftTokenImage } from "./token";

if (!process.env.NEXT_PUBLIC_IMAGE_RESIZER) {
  throw new Error("NEXT_PUBLIC_IMAGE_RESIZER is not set");
}
export const NEXT_PUBLIC_IMAGE_RESIZER = process.env.NEXT_PUBLIC_IMAGE_RESIZER;

if (!process.env.NEXT_PUBLIC_IPFS) {
  throw new Error("NEXT_PUBLIC_IPFS is not set");
}
const NEXT_PUBLIC_IPFS = process.env.NEXT_PUBLIC_IPFS;

export interface Nft {
  collectionName: string;
  contractAddress: string;
  ownedTokens: {
    tokenId: number;
    metadata: IMetadata;
    resizedImage: string;
  }[];
}

export const fetchMetadata = (
  logger: Logger,
  contractMetadata: IERC721Metadata,
  tokenId: BigNumber
) =>
  contractMetadata
    .tokenURI(tokenId)
    .then(async (metadataUrl) => {
      if (metadataUrl.startsWith("ipfs://")) {
        logger.debug(`Fetching metadata from ${metadataUrl}`);
        const response = await fetch(
          `${NEXT_PUBLIC_IPFS}/${metadataUrl.substring(7)}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        const metadata = await response.json();
        return metadata as IMetadata;
      }
      const response = await fetch(metadataUrl, {
        headers: {
          Accept: "application/json",
        },
      });
      const result = await response.json();
      return result as IMetadata;
    })

    .catch((err) => {
      logger.error(err);
      throw new MetadataError(err.message, "METADATA_FETCH_ERROR", err.code);
    });

export async function getEnumerableNftTokens(
  logger: Logger,
  myAddress: string,
  contractAddress: string,
  provider: providers.JsonRpcProvider,
  enumerable: boolean
): Promise<Nft> {
  logger.debug(`getEnumerableNftTokens(${myAddress}, ${contractAddress})`);
  const contractEnumerable = IERC721Enumerable__factory.connect(
    contractAddress,
    provider
  );
  const contractMetadata = IERC721Metadata__factory.connect(
    contractAddress,
    provider
  );
  const nftTokens = (await contractEnumerable.balanceOf(myAddress)).toNumber();
  logger.debug(`Found ${nftTokens} tokens`);
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
  logger.debug(`Found collection name ${collectionName}`);

  if (enumerable) {
    logger.debug(
      `Fetching token details from enumerable contract ${contractAddress}`
    );
    for (let i = 0; i < nftTokens; i++) {
      tokenUris.push(
        contractEnumerable
          .tokenOfOwnerByIndex(myAddress, i)
          .then((tokenId) =>
            fetchMetadata(logger, contractMetadata, tokenId).then(
              (metadata) => {
                let resizedImage = metadata.image;
                if (metadata.image.startsWith("ipfs://")) {
                  logger.debug(`Fetching image from ${metadata.image}`);
                  resizedImage = `${NEXT_PUBLIC_IMAGE_RESIZER}/ipfs/${metadata.image.substring(
                    7
                  )}`;
                }
                return {
                  tokenId: tokenId.toNumber(),
                  metadata: metadata,
                  resizedImage,
                };
              }
            )
          )
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
      contractAddress,
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
        return Promise.all(
          tokenIds.map((tokenId) =>
            fetchMetadata(logger, contractMetadata, tokenId).then(
              (metadata) => {
                let resizedImage = metadata.image;
                if (metadata.image.startsWith("ipfs://")) {
                  logger.debug(`Fetching image from ${metadata.image}`);
                  resizedImage = `${NEXT_PUBLIC_IMAGE_RESIZER}/ipfs/${metadata.image.substring(
                    7
                  )}`;
                }
                return {
                  tokenId: tokenId.toNumber(),
                  metadata: metadata,
                  resizedImage,
                };
              }
            )
          )
        );
      })
      .then((tokenUris) => ({
        collectionName: collectionName,
        contractAddress,
        ownedTokens: tokenUris,
      }));
  }
}
