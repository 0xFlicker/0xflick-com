/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IResolverService,
  IResolverServiceInterface,
} from "../../../contracts/OffchainResolver.sol/IResolverService";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "name",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "resolve",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes",
      },
      {
        internalType: "uint64",
        name: "expires",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IResolverService__factory {
  static readonly abi = _abi;
  static createInterface(): IResolverServiceInterface {
    return new utils.Interface(_abi) as IResolverServiceInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IResolverService {
    return new Contract(address, _abi, signerOrProvider) as IResolverService;
  }
}
