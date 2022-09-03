import { INameflickToken } from "@0xflick/models";
import { utils, Wallet } from "ethers";
import { tokenToStatusDescription } from "./utils";

const randomPoolOfAddresses = new Array(10)
  .fill(0, 0, 10)
  .map(() => Wallet.createRandom().address);
function randomAddress() {
  return randomPoolOfAddresses[
    Math.floor(Math.random() * randomPoolOfAddresses.length)
  ];
}

export const token1: INameflickToken = {
  tokenId: 1,
  metadata: {
    image: "https://image.0xflick.com/nameflick-image/example.nameflick.eth/1",
    name: "Nameflick #1",
    status: "FREE_USE",
    wrappedEns: "*.nameflick.eth",
    description:
      "Free to use. Allows you to claim and use one sub-domain on nameflick.eth",
    records: {
      abc: {
        normalized: "abc.nameflick.eth",
        ttl: 0,
        ensHash: utils.namehash("abc.nameflick.eth"),
        addresses: {
          eth: randomAddress(),
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
          eth: randomAddress(),
        },
        textRecord: {},
      },
    },
  },
};

function* range(start: number, end: number, pad: number = 0) {
  for (let i = start; i < end; i++) {
    yield i.toString().padStart(pad, "0");
  }
}
export const token3: INameflickToken = {
  tokenId: 3,
  metadata: {
    image: "https://image.0xflick.com/nameflick-image/nft.eth/3",
    name: "Nameflick #3",
    status: "COMMUNITY_USE",
    wrappedEns: "nft.eth",
    description: tokenToStatusDescription("COMMUNITY_USE"),
    records: Object.fromEntries(
      [...range(1, 20, 3)].map((i) => [
        i,
        {
          normalized: `${i}.nft.eth`,
          ttl: 0,
          ensHash: utils.namehash(`${i}.nft.eth`),
          addresses: {
            eth: randomAddress(),
          },
          textRecord: {},
        },
      ])
    ),
  },
};

export const tokens = [token1, token2, token3];
