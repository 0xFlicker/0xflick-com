import { BigNumber, constants, utils } from "ethers";
import { useMemo } from "react";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

const RECLAIM_ABI = [
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "reclaim",
    outputs: [] as const,
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const ensBaseRegistrar = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";

export function useEnsReclaim(ensName: string) {
  const tokenId = useMemo<BigNumber>(() => {
    try {
      return BigNumber.from(
        utils.keccak256(utils.toUtf8Bytes(ensName.replace(".eth", "")))
      );
    } catch (e) {
      return BigNumber.from(0);
    }
  }, [ensName]);
  const { address } = useAccount();
  const { config } = usePrepareContractWrite({
    abi: RECLAIM_ABI,
    address: ensBaseRegistrar,
    functionName: "reclaim",
    args: [tokenId, address ?? constants.AddressZero],
  });
  const { data, error, isLoading, isSuccess, write } = useContractWrite(config);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    write,
  };
}
