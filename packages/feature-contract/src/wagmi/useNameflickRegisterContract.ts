import { usePrepareContractWrite } from "wagmi";

const NAMEFLICK_RESOLVER_ABI = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "registerContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function useNameflickRegisterContract() {
  usePrepareContractWrite({
    abi: NAMEFLICK_RESOLVER_ABI,
  });
}
