import { NextApiRequest, NextApiResponse } from "next";
import { nftCollectionsOfInterest, flickEnsDomain } from "utils/config";

import { providers } from "ethers";
import { createLogger, getEnumerableNftTokens } from "@0xflick/backend";

if (!process.env.WEB3_RPC_URL) {
  throw new Error("WEB3_RPC_URL is not set");
}
const WEB3_RPC_URL = process.env.WEB3_RPC_URL;

if (!process.env.NEXT_PUBLIC_IMAGE_RESIZER) {
  throw new Error("NEXT_PUBLIC_IMAGE_RESIZER is not set");
}
const NEXT_PUBLIC_IMAGE_RESIZER = process.env.NEXT_PUBLIC_IMAGE_RESIZER;

if (!process.env.NEXT_PUBLIC_IPFS) {
  throw new Error("NEXT_PUBLIC_IPFS is not set");
}
const NEXT_PUBLIC_IPFS = process.env.NEXT_PUBLIC_IPFS;

async function flickAddress(provider: providers.JsonRpcProvider) {
  return await provider.resolveName(flickEnsDomain.get());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const provider = new providers.JsonRpcProvider(WEB3_RPC_URL);
  const myAddress = await flickAddress(provider);
  if (!myAddress) {
    res.status(500).send("Could not get your address");
    return;
  }
  const nfts = await Promise.all(
    nftCollectionsOfInterest
      .get()
      .map((collection) =>
        getEnumerableNftTokens(
          createLogger({ name: "get-nft-collection" }),
          myAddress,
          collection.address,
          provider,
          collection.isEnumerable
        )
      )
  );
  res.status(200).json(nfts);
}
