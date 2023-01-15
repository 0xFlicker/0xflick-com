import { BigNumber } from "ethers";
import { usePrepareContractWrite, useContractWrite, useNetwork } from "wagmi";
import { nameflickResolvers } from "@0xflick/utils";

const NAMEFLICK_RESOLVER_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "namehash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "supportedCoinsFromEth",
        type: "uint256[]",
      },
    ],
    name: "registerContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function useNameflickRegisterContract({
  namehash,
  contractAddress,
  coinTypes = [BigNumber.from(60)],
  enabled,
}: {
  namehash?: `0x${string}`;
  contractAddress?: `0x${string}`;
  coinTypes?: BigNumber[];
  enabled?: boolean;
}) {
  const { chain } = useNetwork();
  const nameflickResolver = chain?.name
    ? nameflickResolvers.get()[chain.name]
    : undefined;
  const { config } = usePrepareContractWrite({
    abi: NAMEFLICK_RESOLVER_ABI,
    address: nameflickResolver,
    functionName: "registerContract",
    args: [namehash ?? "0x0", contractAddress ?? "0x0", coinTypes],
    enabled,
  });
  return useContractWrite(config);
}
