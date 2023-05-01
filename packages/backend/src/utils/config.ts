export const nftCollectionsOfInterest = {
  get() {
    if (!process.env.NFT_COLLECTIONS_OF_INTEREST) {
      throw new Error("NFT_COLLECTIONS_OF_INTEREST is not set");
    }
    return JSON.parse(process.env.NFT_COLLECTIONS_OF_INTEREST) as {
      address: string;
      isEnumerable: boolean;
    }[];
  },
};

export const flickEnsDomain = {
  get() {
    if (!process.env.FLICK_ENS_DOMAIN) {
      throw new Error("FLICK_ENS_DOMAIN is not set");
    }
    return process.env.FLICK_ENS_DOMAIN;
  },
};

export const ensRpcUrl = {
  get() {
    if (!process.env.ENS_RPC_URL) {
      throw new Error("ENS_RPC_URL is not set");
    }
    return process.env.ENS_RPC_URL;
  },
};

export const publicImageResizerUrl = {
  get() {
    if (!process.env.NEXT_PUBLIC_IMAGE_RESIZER) {
      throw new Error("NEXT_PUBLIC_IMAGE_RESIZER is not set");
    }
    return process.env.NEXT_PUBLIC_IMAGE_RESIZER;
  },
};

export const publicIpfsUrl = {
  get() {
    if (!process.env.NEXT_PUBLIC_IPFS) {
      throw new Error("NEXT_PUBLIC_IPFS is not set");
    }
    return process.env.NEXT_PUBLIC_IPFS;
  },
};
