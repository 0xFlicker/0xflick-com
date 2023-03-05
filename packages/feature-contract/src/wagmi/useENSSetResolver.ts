import {
  usePrepareContractWrite,
  useContractWrite,
  useNetwork,
  useContractRead,
} from "wagmi";
import { hexString, nameflickResolvers } from "@0xflick/utils";

const ENS_SET_RESOLVER_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "resolver",
        type: "address",
      },
    ],
    name: "setResolver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32",
      },
    ],
    name: "resolver",
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

export function useENSSetResolver(namehash?: `0x${string}`) {
  const { chain } = useNetwork();
  const nameflickResolver = chain?.name
    ? nameflickResolvers.get()[chain.name]
    : undefined;
  const ensAddress = chain?.contracts?.ensRegistry?.address;
  const {
    data: resolverData,
    isSuccess: isResolverSuccess,
    refetch,
  } = useContractRead({
    abi: ENS_SET_RESOLVER_ABI,
    address: ensAddress,
    functionName: "resolver",
    args: [namehash ?? "0x0"],
    cacheTime: 0,
  });
  const isResolverSet =
    typeof resolverData !== "undefined" &&
    hexString(resolverData).toLowerCase() === nameflickResolver?.toLowerCase();
  const { config } = usePrepareContractWrite({
    abi: ENS_SET_RESOLVER_ABI,
    address: ensAddress,
    functionName: "setResolver",
    args: [namehash ?? "0x0", nameflickResolver ?? "0x0"],
    enabled: isResolverSuccess,
  });
  return [{ isResolverSet, refetch }, useContractWrite(config)] as const;
}
