import { INameflickToken } from "@0xflick/models";
import { utils, Wallet } from "ethers";

export const token1: INameflickToken = {
  tokenId: 1,
  metadata: {
    image: "https://image.0xflick.com/nameflick-image/example.eth/1",
    name: "Nameflick #1",
    status: "FREE_USE",
    wrappedEns: "example.eth",
    description:
      "Free to use. Allows you to claim and use one sub-domain on nameflick.eth",
    records: {
      apple: {
        normalized: "apple.example.eth",
        ttl: 0,
        ensHash: utils.namehash("apple.example.eth"),
        addresses: {
          eth: Wallet.createRandom().address,
        },
        textRecord: {},
      },
    },
  },
};

export const token2: INameflickToken = {
  tokenId: 2,
  metadata: {
    image: "https://image.0xflick.com/nameflick-image/name.eth/2",
    name: "Nameflick #2",
    status: "PERSONAL_USE",
    wrappedEns: "name.eth",
    description:
      "Wrapped ENS. Allows you to set unlimited sub-domains and records on one ENS name",
    records: {
      alpha: {
        normalized: "alpha.name.eth",
        ttl: 0,
        ensHash: utils.namehash("alpha.name.eth"),
        addresses: {
          eth: Wallet.createRandom().address,
        },
        textRecord: {},
      },
    },
  },
};
