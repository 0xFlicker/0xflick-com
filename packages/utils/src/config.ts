import { chain, Chain, allChains } from "wagmi";
import { lazySingleton } from "./factory";

export const infuraKey = {
  get() {
    if (!process.env.NEXT_PUBLIC_INFURA_KEY) {
      throw new Error("INFURA_KEY not set");
    }
    return process.env.NEXT_PUBLIC_INFURA_KEY;
  },
};

export const alchemyKey = {
  get() {
    if (!process.env.NEXT_PUBLIC_ALCHEMY_KEY) {
      throw new Error("ALCHEMY_KEY not set");
    }
    return process.env.NEXT_PUBLIC_ALCHEMY_KEY;
  },
};

export const nftCollectionsOfInterest = lazySingleton(() => {
  if (!process.env.NFT_COLLECTIONS_OF_INTEREST) {
    throw new Error("NFT_COLLECTIONS_OF_INTEREST is not set");
  }
  return JSON.parse(process.env.NFT_COLLECTIONS_OF_INTEREST) as {
    address: string;
    isEnumerable: boolean;
  }[];
});

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

export const ipfsApiUrl = {
  get() {
    if (!process.env.IPFS_API_URL) {
      throw new Error("IPFS_API_URL is not set");
    }
    return process.env.IPFS_API_URL;
  },
};

export const ipfsApiHeaders = {
  get() {
    if (!process.env.IPFS_API_PROJECT) {
      throw new Error("IPFS_API_PROJECT is not set");
    }

    if (!process.env.IPFS_API_SECRET) {
      throw new Error("IPFS_API_SECRET is not set");
    }
    return {
      Authorization: `Basic ${Buffer.from(
        `${process.env.IPFS_API_PROJECT}:${process.env.IPFS_API_SECRET}`
      ).toString("base64")}`,
    };
  },
};

export const appName = {
  get() {
    if (!process.env.NEXT_PUBLIC_APP_NAME) {
      throw new Error("NEXT_PUBLIC_APP_NAME is not set");
    }
    return process.env.NEXT_PUBLIC_APP_NAME;
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

export const supportedChains = lazySingleton(() => {
  if (!process.env.NEXT_PUBLIC_SUPPORTED_CHAINS) {
    throw new Error("SUPPORTED_CHAINS is not set");
  }
  const supportedChainNames: keyof typeof chain = JSON.parse(
    process.env.NEXT_PUBLIC_SUPPORTED_CHAINS
  );
  const chains: Chain[] = [];
  for (const chainName of supportedChainNames) {
    const wagmiChain = allChains.find(({ network }) => network === chainName);
    if (wagmiChain) {
      chains.push(wagmiChain);
    }
  }
  return chains;
});

export const defaultChain = lazySingleton(() => {
  if (!process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) {
    throw new Error("NEXT_PUBLIC_DEFAULT_CHAIN_ID is not set");
  }
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
  const wagmiChain = allChains.find(({ id }) => id === Number(chainId));
  return wagmiChain;
});
