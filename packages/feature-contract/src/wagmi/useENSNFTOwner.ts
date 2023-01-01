import { BigNumber, constants, utils } from "ethers";
import { useMemo } from "react";
import { useContractRead } from "wagmi";

const OWNER_OF_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "ownerOf",
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

const ensBaseRegistrar = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";

export function useENSNFTOwner(ensName: string) {
  const tokenId = useMemo<BigNumber>(() => {
    try {
      return BigNumber.from(
        utils.keccak256(utils.toUtf8Bytes(ensName.replace(".eth", "")))
      );
    } catch (e) {
      return BigNumber.from(0);
    }
  }, [ensName]);
  const { data, error, isLoading, isSuccess, refetch } = useContractRead({
    abi: OWNER_OF_ABI,
    address: ensBaseRegistrar,
    functionName: "ownerOf",
    args: [tokenId],
  });

  return {
    data,
    error,
    isLoading,
    isSuccess,
    refetch,
  };
}
