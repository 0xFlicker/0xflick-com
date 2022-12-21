import { utils } from "ethers";
import { useMemo } from "react";
import {
  useAccount,
  useContractRead,
  useNetwork,
  useContractReads,
} from "wagmi";
import { hexString } from "@0xflick/utils";
import { useWeb3 } from "@0xflick/feature-web3";

const ENS_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
    name: "owner",
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
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "node",
        type: "bytes32",
      },
    ],
    name: "recordExists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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

export function useEnsAccountIsApproved(ensName: string) {
  const node = useMemo(() => hexString(utils.dnsEncode(ensName)), [ensName]);
  const { chain } = useNetwork();
  const { selectedAddress: address, isConnected } = useWeb3();
  const ensAddress = chain?.contracts?.ensRegistry?.address;
  const {
    data: existentialData,
    error: existentialError,
    isLoading: existentialLoading,
    isFetched: existentialFetched,
  } = useContractReads({
    contracts: [
      {
        functionName: "recordExists",
        args: [node],
        abi: ENS_ABI,
        address: ensAddress,
      },
      {
        functionName: "owner",
        args: [node],
        abi: ENS_ABI,
        address: ensAddress,
      },
    ],
    enabled: isConnected,
  });

  const [recordExists, owner] = existentialData ?? [];
  const isOwner = address === owner;
  const isApprovedForAllFetchEnabled = existentialFetched && !isOwner;
  const {
    data: isApprovedForAll,
    error: isApprovedForAllError,
    isLoading: isApprovedForAllLoading,
    isFetched: isApprovedForAllFetched,
  } = useContractRead({
    functionName: "isApprovedForAll",
    args: owner && address ? [owner, address] : ["0x", "0x"],
    abi: ENS_ABI,
    address: ensAddress,
    enabled: isApprovedForAllFetchEnabled,
  });

  return {
    recordExists,
    isApprovedOrOwner: isOwner || isApprovedForAll,
    isFetching: existentialLoading || isApprovedForAllLoading,
    isFetched:
      existentialFetched &&
      (!isApprovedForAllFetchEnabled || isApprovedForAllFetched),
    error: existentialError || isApprovedForAllError,
  };
}
