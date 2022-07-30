if (!process.env.NFT_COLLECTIONS_OF_INTEREST) {
  throw new Error("NFT_COLLECTIONS_OF_INTEREST is not set");
}

export const nftCollectionsOfInterest = JSON.parse(
  process.env.NFT_COLLECTIONS_OF_INTEREST
) as {
  address: string;
  isEnumerable: boolean;
}[];

if (!process.env.FLICK_ENS_DOMAIN) {
  throw new Error("FLICK_ENS_DOMAIN is not set");
}

export const flickEnsDomain = process.env.FLICK_ENS_DOMAIN;

if (!process.env.ENS_RPC_URL) {
  throw new Error("ENS_RPC_URL is not set");
}
export const ensRpcUrl = process.env.ENS_RPC_URL;

if (!process.env.IPFS_API_URL) {
  throw new Error("IPFS_API_URL is not set");
}

export const ipfsApiUrl = process.env.IPFS_API_URL;

if (!process.env.IPFS_API_PROJECT) {
  throw new Error("IPFS_API_PROJECT is not set");
}

if (!process.env.IPFS_API_SECRET) {
  throw new Error("IPFS_API_SECRET is not set");
}

export const ipfsApiHeaders = {
  Authorization: `Basic ${Buffer.from(
    `${process.env.IPFS_API_PROJECT}:${process.env.IPFS_API_SECRET}`
  ).toString("base64")}`,
};
