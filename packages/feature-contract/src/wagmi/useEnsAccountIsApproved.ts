import { utils } from "ethers";
import { useCallback, useMemo } from "react";
import { useContractRead, useNetwork, useContractReads } from "wagmi";
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
  const node = useMemo(() => {
    try {
      return hexString(utils.namehash(ensName));
    } catch (e) {
      // Ignore, but return undefined
      return undefined;
    }
  }, [ensName]);

  const { chain } = useNetwork();
  const { selectedAddress: address, isConnected } = useWeb3();
  const ensAddress = chain?.contracts?.ensRegistry?.address;
  const {
    data: existentialData,
    error: existentialError,
    isLoading: existentialLoading,
    isFetched: existentialFetched,
    refetch: refetchExistential,
  } = useContractReads({
    contracts: [
      {
        functionName: "recordExists",
        args: [node ?? "0x0"],
        abi: ENS_ABI,
        address: ensAddress,
      },
      {
        functionName: "owner",
        args: [node ?? "0x0"],
        abi: ENS_ABI,
        address: ensAddress,
      },
    ],
    enabled: !!ensName && isConnected && !!ensAddress,
  });

  const [recordExists, owner] = existentialData ?? [];
  const isOwner = address && owner && address === owner;
  const isApprovedForAllFetchEnabled = existentialFetched && !isOwner;
  const {
    data: isApprovedForAll,
    error: isApprovedForAllError,
    isLoading: isApprovedForAllLoading,
    isFetched: isApprovedForAllFetched,
    refetch: refetchIsApprovedForAll,
  } = useContractRead({
    functionName: "isApprovedForAll",
    args: owner && address ? [owner, address] : ["0x", "0x"],
    abi: ENS_ABI,
    address: ensAddress,
    enabled:
      !!ensName && isApprovedForAllFetchEnabled && isConnected && !!ensAddress,
  });
  const refetch = useCallback(() => {
    refetchExistential();
  }, [refetchExistential]);
  return {
    refetch,
    recordExists: ensName.length > 0 && existentialFetched && recordExists,
    isApprovedOrOwner: isOwner || isApprovedForAll,
    isOwner,
    isApprovedForAll,
    isFetching: existentialLoading || isApprovedForAllLoading,
    isFetched:
      existentialFetched &&
      (!isApprovedForAllFetchEnabled || isApprovedForAllFetched),
    error: existentialError || isApprovedForAllError,
  };
}
