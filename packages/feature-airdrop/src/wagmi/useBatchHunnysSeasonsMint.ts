import { useContractWrite } from "wagmi";
import { polygon } from "@wagmi/chains";
import * as ethers from "ethers";

const MULTICALL3_ABI = [
  {
    inputs: [
      {
        internalType: "bool",
        name: "requireSuccess",
        type: "bool",
      },
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "tryBlockAndAggregate",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

const ADMIN_MINT_ABI = [
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const HunnysSeasonsContractAddress =
  "0x43668e306dba9172824524fd2c0c6924e710ea5b";

interface IAdminMint {
  tokenId: number;
  quantity: number;
  data: string;
}

function createMulticall3TryAggregateInput(mints: IAdminMint[]) {
  const interface = new ethers.utils.Interface(ADMIN_MINT_ABI);

  const calls = mints.map((mint) =>
    interface.encodeFunctionData("mint", [
      mint.tokenId,
      mint.quantity,
      mint.data,
    ])
  );

  return calls;
}

function createTransaction(mints: IAdminMint[]) {
  const multicallTryAggreagate = new ethers.utils.Interface(MULTICALL3_ABI);

  const mutlicallTx = {
    to: HunnysSeasonsContractAddress,
    data: multicallTryAggreagate.encodeFunctionData("tryBlockAndAggregate", [
      true,
      
}
