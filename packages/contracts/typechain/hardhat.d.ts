/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "SignerManager",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SignerManager__factory>;
    getContractFactory(
      name: "BaseTokenURI",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.BaseTokenURI__factory>;
    getContractFactory(
      name: "ERC721ACommon",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721ACommon__factory>;
    getContractFactory(
      name: "ERC721APreApproval",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721APreApproval__factory>;
    getContractFactory(
      name: "ERC721Enumerator",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721Enumerator__factory>;
    getContractFactory(
      name: "IERC721NotQuiteEnumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721NotQuiteEnumerable__factory>;
    getContractFactory(
      name: "ERC721Redeemer",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721Redeemer__factory>;
    getContractFactory(
      name: "FixedPriceSeller",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FixedPriceSeller__factory>;
    getContractFactory(
      name: "Seller",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Seller__factory>;
    getContractFactory(
      name: "ProxyRegistry",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ProxyRegistry__factory>;
    getContractFactory(
      name: "OwnerPausable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OwnerPausable__factory>;
    getContractFactory(
      name: "BaseRegistrarImplementation",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.BaseRegistrarImplementation__factory>;
    getContractFactory(
      name: "IBaseRegistrar",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBaseRegistrar__factory>;
    getContractFactory(
      name: "ENS",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ENS__factory>;
    getContractFactory(
      name: "ENSRegistry",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ENSRegistry__factory>;
    getContractFactory(
      name: "AccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControl__factory>;
    getContractFactory(
      name: "AccessControlEnumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControlEnumerable__factory>;
    getContractFactory(
      name: "IAccessControl",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControl__factory>;
    getContractFactory(
      name: "IAccessControlEnumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControlEnumerable__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "PaymentSplitter",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.PaymentSplitter__factory>;
    getContractFactory(
      name: "IERC2981",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC2981__factory>;
    getContractFactory(
      name: "Pausable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Pausable__factory>;
    getContractFactory(
      name: "ERC2981",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC2981__factory>;
    getContractFactory(
      name: "IERC20Permit",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Permit__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "ERC721",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721__factory>;
    getContractFactory(
      name: "IERC721Enumerable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Enumerable__factory>;
    getContractFactory(
      name: "IERC721Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Metadata__factory>;
    getContractFactory(
      name: "IERC721",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721__factory>;
    getContractFactory(
      name: "IERC721Receiver",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Receiver__factory>;
    getContractFactory(
      name: "ERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC165__factory>;
    getContractFactory(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165__factory>;
    getContractFactory(
      name: "Enumerator",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Enumerator__factory>;
    getContractFactory(
      name: "FlickENS",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FlickENS__factory>;
    getContractFactory(
      name: "IExtendedResolverWithProof",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IExtendedResolverWithProof__factory>;
    getContractFactory(
      name: "ITokenURIGenerator",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ITokenURIGenerator__factory>;
    getContractFactory(
      name: "IERC721A",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721A__factory>;
    getContractFactory(
      name: "IERC721AQueryable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721AQueryable__factory>;
    getContractFactory(
      name: "IERC721Enumerator",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Enumerator__factory>;
    getContractFactory(
      name: "IExtendedResolver",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IExtendedResolver__factory>;
    getContractFactory(
      name: "ITokenURIGenerator",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ITokenURIGenerator__factory>;
    getContractFactory(
      name: "NFT",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.NFT__factory>;
    getContractFactory(
      name: "IResolverService",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IResolverService__factory>;
    getContractFactory(
      name: "OffchainResolver",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OffchainResolver__factory>;
    getContractFactory(
      name: "ERC721A",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721A__factory>;
    getContractFactory(
      name: "ERC721AQueryable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC721AQueryable__factory>;
    getContractFactory(
      name: "IERC721AQueryable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721AQueryable__factory>;
    getContractFactory(
      name: "IERC721A",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721A__factory>;

    getContractAt(
      name: "SignerManager",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SignerManager>;
    getContractAt(
      name: "BaseTokenURI",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.BaseTokenURI>;
    getContractAt(
      name: "ERC721ACommon",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721ACommon>;
    getContractAt(
      name: "ERC721APreApproval",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721APreApproval>;
    getContractAt(
      name: "ERC721Enumerator",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721Enumerator>;
    getContractAt(
      name: "IERC721NotQuiteEnumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721NotQuiteEnumerable>;
    getContractAt(
      name: "ERC721Redeemer",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721Redeemer>;
    getContractAt(
      name: "FixedPriceSeller",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.FixedPriceSeller>;
    getContractAt(
      name: "Seller",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Seller>;
    getContractAt(
      name: "ProxyRegistry",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ProxyRegistry>;
    getContractAt(
      name: "OwnerPausable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OwnerPausable>;
    getContractAt(
      name: "BaseRegistrarImplementation",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.BaseRegistrarImplementation>;
    getContractAt(
      name: "IBaseRegistrar",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBaseRegistrar>;
    getContractAt(
      name: "ENS",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ENS>;
    getContractAt(
      name: "ENSRegistry",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ENSRegistry>;
    getContractAt(
      name: "AccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControl>;
    getContractAt(
      name: "AccessControlEnumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControlEnumerable>;
    getContractAt(
      name: "IAccessControl",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControl>;
    getContractAt(
      name: "IAccessControlEnumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControlEnumerable>;
    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "PaymentSplitter",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.PaymentSplitter>;
    getContractAt(
      name: "IERC2981",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC2981>;
    getContractAt(
      name: "Pausable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Pausable>;
    getContractAt(
      name: "ERC2981",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC2981>;
    getContractAt(
      name: "IERC20Permit",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Permit>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "ERC721",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721>;
    getContractAt(
      name: "IERC721Enumerable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Enumerable>;
    getContractAt(
      name: "IERC721Metadata",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Metadata>;
    getContractAt(
      name: "IERC721",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721>;
    getContractAt(
      name: "IERC721Receiver",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Receiver>;
    getContractAt(
      name: "ERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC165>;
    getContractAt(
      name: "IERC165",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165>;
    getContractAt(
      name: "Enumerator",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Enumerator>;
    getContractAt(
      name: "FlickENS",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.FlickENS>;
    getContractAt(
      name: "IExtendedResolverWithProof",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IExtendedResolverWithProof>;
    getContractAt(
      name: "ITokenURIGenerator",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ITokenURIGenerator>;
    getContractAt(
      name: "IERC721A",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721A>;
    getContractAt(
      name: "IERC721AQueryable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721AQueryable>;
    getContractAt(
      name: "IERC721Enumerator",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Enumerator>;
    getContractAt(
      name: "IExtendedResolver",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IExtendedResolver>;
    getContractAt(
      name: "ITokenURIGenerator",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ITokenURIGenerator>;
    getContractAt(
      name: "NFT",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.NFT>;
    getContractAt(
      name: "IResolverService",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IResolverService>;
    getContractAt(
      name: "OffchainResolver",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OffchainResolver>;
    getContractAt(
      name: "ERC721A",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721A>;
    getContractAt(
      name: "ERC721AQueryable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC721AQueryable>;
    getContractAt(
      name: "IERC721AQueryable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721AQueryable>;
    getContractAt(
      name: "IERC721A",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721A>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
