// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
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
import "erc721a/contracts/interfaces/IERC721AQueryable.sol";
import "./IExtendedResolver.sol";
import "./SignatureVerifier.sol";
import "./StringToUintLib.sol";

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

/**
 * Implements an ENS resolver that directs all queries to a CCIP read gateway.
 * Callers must implement EIP 3668 and ENSIP 10.
 */

contract NameflickENSResolver is IExtendedResolver, ERC165, Ownable {
  using StringToUintLib for string;

  struct Resolution {
    address controller;
  }
  string[] public urls;
  mapping(address => bool) public signers;
  mapping(bytes32 => uint64) public expires;

  ENS immutable ens;
  address public parentContract;
  address immutable trustedReverseRegistrar;

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
    address _trustedReverseRegistrar,
    address _parentContract,
    string[] memory _urls,
    address[] memory _signers
  ) {
    ens = _ens;
    trustedReverseRegistrar = _trustedReverseRegistrar;
    parentContract = _parentContract;
    urls = _urls;
    for (uint256 i = 0; i < _signers.length; i++) {
      signers[_signers[i]] = true;
    }
    emit NewSigners(_signers);
  }

  function setOffchainResolver(string[] memory _urls) external onlyOwner {
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
    returns (bytes memory)
  {
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
