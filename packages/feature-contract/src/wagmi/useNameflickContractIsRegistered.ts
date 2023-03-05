import { BigNumber, utils } from "ethers";
import { useContractRead, useNetwork } from "wagmi";
import { nameflickResolvers } from "@0xflick/utils";

const NAMEFLICK_NFTS_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "nfts",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useNameflickContractIsRegistered({
  namehash,
  contractAddress,
}: {
  namehash?: `0x${string}`;
  contractAddress?: `0x${string}`;
}) {
  const enabled =
    typeof contractAddress !== "undefined" &&
    contractAddress !== "0x0" &&
    utils.isAddress(contractAddress);
  const { chain } = useNetwork();
  const nameflickResolver = chain?.name
    ? nameflickResolvers.get()[chain.name]
    : undefined;
  const { data, ...rest } = useContractRead({
    abi: NAMEFLICK_NFTS_ABI,
    address: nameflickResolver,
    functionName: "nfts",
    args: [namehash ?? "0x0"],
    cacheTime: 0,
    enabled,
  });

  return {
    data:
      typeof data !== "undefined" && enabled
        ? data.toLowerCase() === contractAddress?.toLowerCase()
        : undefined,
    ...rest,
  };
}
