/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  SignerManager,
  SignerManagerInterface,
} from "../../../../../@divergencetech/ethier/contracts/crypto/SignerManager";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
    ],
    name: "addSigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
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
        internalType: "address",
        name: "signer",
        type: "address",
      },
    ],
    name: "removeSigner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6104698061007e6000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80630e316ab71461005c578063715018a6146100715780638da5cb5b14610079578063eb12d61e1461009d578063f2fde38b146100b0575b600080fd5b61006f61006a3660046103b2565b6100c3565b005b61006f6100da565b6100816100ee565b6040516001600160a01b03909116815260200160405180910390f35b61006f6100ab3660046103b2565b6100fd565b61006f6100be3660046103b2565b610110565b6100cb61018e565b6100d66001826101ed565b5050565b6100e261018e565b6100ec600061020b565b565b6000546001600160a01b031690565b61010561018e565b6100d660018261025b565b61011861018e565b6001600160a01b0381166101825760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084015b60405180910390fd5b61018b8161020b565b50565b336101976100ee565b6001600160a01b0316146100ec5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610179565b6000610202836001600160a01b038416610270565b90505b92915050565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000610202836001600160a01b038416610363565b600081815260018301602052604081205480156103595760006102946001836103e2565b85549091506000906102a8906001906103e2565b905081811461030d5760008660000182815481106102c8576102c8610407565b90600052602060002001549050808760000184815481106102eb576102eb610407565b6000918252602080832090910192909255918252600188019052604090208390555b855486908061031e5761031e61041d565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050610205565b6000915050610205565b60008181526001830160205260408120546103aa57508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155610205565b506000610205565b6000602082840312156103c457600080fd5b81356001600160a01b03811681146103db57600080fd5b9392505050565b60008282101561040257634e487b7160e01b600052601160045260246000fd5b500390565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052603160045260246000fdfea2646970667358221220e54d1647f0cf47119eaf0b22c970cfc18f35d553cb6a15e4f421551644a4459964736f6c63430008090033";

type SignerManagerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SignerManagerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SignerManager__factory extends ContractFactory {
  constructor(...args: SignerManagerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<SignerManager> {
    return super.deploy(overrides || {}) as Promise<SignerManager>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SignerManager {
    return super.attach(address) as SignerManager;
  }
  override connect(signer: Signer): SignerManager__factory {
    return super.connect(signer) as SignerManager__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SignerManagerInterface {
    return new utils.Interface(_abi) as SignerManagerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SignerManager {
    return new Contract(address, _abi, signerOrProvider) as SignerManager;
  }
}