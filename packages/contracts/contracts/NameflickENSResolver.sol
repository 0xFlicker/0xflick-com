// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/ABIResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/AddrResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/ContentHashResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/DNSResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/InterfaceResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/NameResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/PubkeyResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/TextResolver.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/IExtendedResolver.sol";

import "erc721a/contracts/interfaces/IERC721AQueryable.sol";
import "./SignatureVerifier.sol";
import "./StringToUintLib.sol";
import "./BytesLib.sol";

interface IResolverService {
  function resolve(bytes calldata name, bytes calldata data)
    external
    view
    returns (
      bytes memory result,
      uint64 expires,
      bytes memory sig
    );
}

// interface INameflickContractLookup {
//   function getContract(bytes calldata name) external view returns (address);

//   function isRegistered(bytes calldata name) external view returns (bool);
// }

// sighash of addr(bytes32)
bytes4 constant ADDR_ETH_INTERFACE_ID = 0x3b3b57de;
// sighash of addr(bytes32,uint)
bytes4 constant ADDR_INTERFACE_ID = 0xf1cb7e06;

/**
 * Implements an ENS resolver that directs all queries to a CCIP read gateway.
 * Callers must implement EIP 3668 and ENSIP 10.
 */
contract NameflickENSResolver is IExtendedResolver, ERC165, Ownable {
  using StringToUintLib for string;
  using BytesLib for bytes;

  struct Resolution {
    address controller;
  }
  string[] public urls;
  mapping(address => bool) public signers;
  mapping(bytes => address) public nfts;

  ENS immutable ens;
  address public parentContract;
  // address immutable trustedReverseRegistrar;
  // address public nameflickContractResolver;

  error ERC1155_CannotResolveAddress();
  error ERC721_InvalidToken();

  event NewSigners(address[] signers);

  error OffchainLookup(
    address sender,
    string[] urls,
    bytes callData,
    bytes4 callbackFunction,
    bytes extraData
  );

  constructor(
    ENS _ens,
    address _parentContract,
    string[] memory _urls,
    address[] memory _signers
  ) {
    ens = _ens;
    // trustedReverseRegistrar = _trustedReverseRegistrar;
    parentContract = _parentContract;
    urls = _urls;
    for (uint256 i = 0; i < _signers.length; i++) {
      signers[_signers[i]] = true;
    }
    emit NewSigners(_signers);
  }

  function setUrls(string[] memory _urls) external onlyOwner {
    urls = _urls;
  }

  /**
   * Resolves a name, as specified by ENSIP 10.
   * @param name The DNS-encoded name to resolve.
   * @param data The ABI encoded data for the underlying resolution function (Eg, addr(bytes32), text(bytes32,string), etc).
   * @return The return data, ABI encoded identically to the underlying function.
   */
  function resolve(bytes calldata name, bytes calldata data)
    external
    view
    override
    returns (bytes memory, address)
  {
    // Check if there is a registered nameflick contract
    // if (nameflickContractResolver != address(0)) {
    //   if (
    //     IERC165(nameflickContractResolver).supportsInterface(
    //       type(INameflickContractLookup).interfaceId
    //     ) &&
    //     INameflickContractLookup(nameflickContractResolver).isRegistered(
    //       name
    //     ) &&
    //     IERC165(nameflickContractResolver).supportsInterface(
    //       type(IExtendedResolver).interfaceId
    //     )
    //   ) {
    //     // if so, resolve the address from the contract resolver
    //     return IExtendedResolver(nameflickContractResolver).resolve(name, data);
    //   }
    // }

    bytes memory callData = abi.encodeWithSelector(
      IResolverService.resolve.selector,
      name,
      data
    );
    revert OffchainLookup(
      parentContract,
      urls,
      callData,
      NameflickENSResolver.resolveWithProof.selector,
      callData
    );
  }

  /**
   * Callback used by CCIP read compatible clients to verify and parse the response.
   */
  function resolveWithProof(bytes calldata response, bytes calldata extraData)
    external
    view
    returns (bytes memory)
  {
    (address signer, bytes memory result) = SignatureVerifier.verify(
      parentContract,
      extraData,
      response
    );
    require(signers[signer], "SignatureVerifier: Invalid sigature");
    return result;
  }

  function supportsInterface(bytes4 interfaceID)
    public
    view
    override
    returns (bool)
  {
    return
      interfaceID == type(IExtendedResolver).interfaceId ||
      super.supportsInterface(interfaceID);
  }

  function stringToUint(string memory s) public pure returns (uint256) {
    (bool success, uint256 result) = s.toUint();
    if (!success) {
      revert("invalid string");
    }
    return result;
  }

  function isContractERC721(address contractAddress)
    public
    view
    returns (bool)
  {
    return ERC165(contractAddress).supportsInterface(type(IERC721).interfaceId);
  }

  function isContractERC1155(address contractAddress)
    public
    view
    returns (bool)
  {
    return
      ERC165(contractAddress).supportsInterface(type(IERC1155).interfaceId);
  }

  function registerContract(bytes calldata name, address contractAddress)
    external
    onlyOwner
  {
    // If so, check if the caller is the owner
    require(
      Ownable(contractAddress).owner() == msg.sender,
      "Caller not owner of contract"
    );
    // Check if the name is owner for the ENS
    require(
      ens.owner(name.namehash(0)) == msg.sender,
      "Name not owner for ENS"
    );
    // If so, register the contract
    nfts[name] = contractAddress;
  }

  function contractForName(bytes calldata name)
    external
    view
    returns (address)
  {
    return nfts[name];
  }

  function ownerOfName(address contractAddress, uint256 tokenId)
    public
    view
    returns (address)
  {
    if (isContractERC1155(contractAddress)) {
      revert ERC1155_CannotResolveAddress();
    }
    if (isContractERC721(contractAddress)) {
      return IERC721(contractAddress).ownerOf(tokenId);
    }
    revert ERC721_InvalidToken();
  }

  // function isAuthorised(bytes32 node) internal view override returns (bool) {
  //   if (msg.sender == trustedReverseRegistrar) {
  //     return true;
  //   }
  //   address owner = ens.owner(node);
  //   if (owner == address(nameWrapper)) {
  //     owner = nameWrapper.ownerOf(uint256(node));
  //   }
  //   return owner == msg.sender || isApprovedForAll(owner, msg.sender);
  // }
}
