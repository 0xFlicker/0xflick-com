import { IFieldResolver } from "@graphql-tools/utils";
import { IOwnedToken, urlToShortUrl } from "@0xflick/models";
import { createLogger } from "@0xflick/backend";
import { TContext } from "../../context";
import { fetchMetadata } from "./common";
import { IERC721Metadata__factory } from "@0xflick/contracts";
import { BigNumber } from "ethers";
import { publicImageResizerUrl } from "../../utils/config";
import { IChainContext } from "../chain";

const logger = createLogger({
  name: "graphql/resolvers/nfts/token",
});

export type TTokenContext = IOwnedToken & IChainContext;

function formatSizeParams(params: URLSearchParams) {
  let hasParams = false;
  for (const _ of params.values()) {
    hasParams = true;
    break;
  }
  return hasParams ? `?${params.toString()}` : "";
}

export const resolveNftTokenImage: IFieldResolver<
  TTokenContext,
  TContext,
  {
    width?: number;
    height?: number;
  },
  Promise<string | null>
> = async (nft, args, context) => {
  const { urlShortenerDao } = context;
  if (!nft.metadata) {
    logger.info(`No metadata found for ${nft.tokenId} so cannot return image`);
    return null;
  }
  const image = nft?.metadata?.image;
  if (!image) {
    logger.info(`No image found for ${nft.tokenId} so cannot return image`);
    return null;
  }
  const params = new URLSearchParams();
  if (args.width) {
    params.append("w", args.width.toString());
  }
  if (args.height) {
    params.append("h", args.height.toString());
  }
  if (image.startsWith("ipfs://")) {
    const ipfsFileHash = image.substring(7);
    return `${publicImageResizerUrl.get()}/ipfs/${ipfsFileHash}${formatSizeParams(
      params
    )}`;
  }

  const [shortUrlSource, imageName] = urlToShortUrl(image);
  logger.info(
    `Resolving image shorturl for ${image} using ${shortUrlSource}/${imageName}`
  );
  const urlShortened = await urlShortenerDao.create(shortUrlSource);
  logger.debug(`Shortened url is ${urlShortened.hash}`);
  return `${publicImageResizerUrl.get()}/web/${
    urlShortened.hash
  }/${imageName}${formatSizeParams(params)}`;
};

export const resolveImage: IFieldResolver<
  TTokenContext,
  TContext,
  {
    contract: string;
    tokenId: number;
    width?: number;
    height?: number;
  },
  Promise<string | null>
> = async (nft, { contract, tokenId, width, height }, context) => {
  const { providerForChain, urlShortenerDao } = context;
  const provider = providerForChain(nft.chainId);
  const contractMetadata = IERC721Metadata__factory.connect(contract, provider);
  const metadata = await fetchMetadata(
    logger,
    contractMetadata,
    BigNumber.from(tokenId)
  );
  const image = metadata?.image;
  if (!image) {
    logger.info(`No image found for ${nft.tokenId} so cannot return image`);
    return null;
  }
  const params = new URLSearchParams();
  if (width) {
    params.append("w", width.toString());
  }
  if (height) {
    params.append("h", height.toString());
  }
  if (image.startsWith("ipfs://")) {
    const ipfsFileHash = image.substring(7);

    return `${publicImageResizerUrl.get()}/ipfs/${ipfsFileHash}?${params.toString()}`;
  }
  const [shortUrlSource, imageName] = urlToShortUrl(image);
  const urlShortened = await urlShortenerDao.create(shortUrlSource);
  return `${publicImageResizerUrl.get()}/web/${urlShortened}/${imageName}?${params.toString()}`;
};
