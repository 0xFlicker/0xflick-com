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
import "hardhat/console.sol";

import "./SignatureVerifier.sol";
import "./StringToUintLib.sol";
import "./BytesLib.sol";

interface IResolverService {
  function resolve(
    bytes calldata name,
    bytes calldata data
  )
    external
    view
    returns (bytes memory result, uint64 expires, bytes memory sig);
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

  mapping(bytes32 => address) public nfts;
  /**
   * @dev tracks what coins (chains) are supported by a given NFT. The format of the bytes32 is abi.encodePacked(address, coinId)
   */
  mapping(bytes32 => bool) public nftOnCoin;

  ENS immutable ens;
  address public parentContract;
  // address immutable trustedReverseRegistrar;
  // address public nameflickContractResolver;

  error ERC1155_CannotResolveAddress();
  error ERC721_InvalidToken();

  event NewSigners(address[] signers);
  event RegisterContract(bytes32 name, address contractAddress);

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

  function addressToBytes(address a) internal pure returns (bytes memory b) {
    b = new bytes(20);
    assembly {
      mstore(add(b, 32), mul(a, exp(256, 12)))
    }
  }

  function ownerOfNft(
    uint256 tokenId,
    address nftContract
  ) internal view returns (bool success, address owner) {
    bytes memory result;
    (success, result) = address(nftContract).staticcall(
      abi.encodeWithSignature("ownerOf(uint256)", tokenId)
    );
    if (!success) {
      owner = address(0);
    } else {
      owner = abi.decode(result, (address));
    }
  }

  function isCoinSupportedByNft(
    address nftContract,
    uint64 coinId
  ) internal view returns (bool) {
    return nftOnCoin[keccak256(abi.encode(nftContract, uint256(coinId)))];
  }

  function getParentContract() public view returns (address) {
    return parentContract == address(0) ? address(this) : parentContract;
  }

  function revertOffchainLookup(
    bytes calldata name,
    bytes calldata data
  ) internal view {
    bytes memory callData = abi.encodeWithSelector(
      IResolverService.resolve.selector,
      name,
      data
    );
    revert OffchainLookup(
      getParentContract(),
      urls,
      callData,
      NameflickENSResolver.resolveWithProof.selector,
      callData
    );
  }

  /**
   * Resolves a name, as specified by ENSIP 10.
   * @param name The DNS-encoded name to resolve.
   * @param data The ABI encoded data for the underlying resolution function (Eg, addr(bytes32), text(bytes32,string), etc).
   * @return The return data, ABI encoded identically to the underlying function.
   */
  function resolve(
    bytes calldata name,
    bytes calldata data
  ) external view override returns (bytes memory, address) {
    // Get the parent node
    bytes32 parentNode = name.namehash(uint8(name[0]) + 1);
    if (nfts[parentNode] != address(0)) {
      address nft = nfts[parentNode];
      // First check if this is a request for addr(bytes32,uint) or addr(bytes32)
      // If it is, we can return the owner of the NFT
      bytes4 selector = data.getBytes4(0);
      if (selector == ADDR_ETH_INTERFACE_ID) {
        if (!isCoinSupportedByNft(nft, 60)) {
          revertOffchainLookup(name, data);
        }
        // get the tokenID from the sub-domain label in name
        (bool success, uint256 tokenId) = name.getNodeString(0).toUint();
        if (!success) {
          revertOffchainLookup(name, data);
        }
        address owner;
        (success, owner) = ownerOfNft(tokenId, nft);
        if (!success) {
          revertOffchainLookup(name, data);
        }
        return (addressToBytes(owner), nft);
      } else if (selector == ADDR_INTERFACE_ID) {
        // When calling addr(bytes32,uint), the second parameter is the coin ID
        // So we only return the ownerOf if the
        uint256 coinId = uint256(data.getBytes32(36));
        if (!nftOnCoin[keccak256(abi.encode(nft, coinId))]) {
          revertOffchainLookup(name, data);
        }
        // get the tokenID from the sub-domain label in name
        (bool success, uint256 tokenId) = name.getNodeString(0).toUint();
        if (!success) {
          revertOffchainLookup(name, data);
        }
        address owner;
        (success, owner) = ownerOfNft(tokenId, nft);
        if (!success) {
          revertOffchainLookup(name, data);
        }
        return (addressToBytes(owner), nft);
      } else {
        revert ERC721_InvalidToken();
      }
    }
    revertOffchainLookup(name, data);
  }

  /**
   * Callback used by CCIP read compatible clients to verify and parse the response.
   */
  function resolveWithProof(
    bytes calldata response,
    bytes calldata extraData
  ) external view returns (bytes memory) {
    (address signer, bytes memory result) = SignatureVerifier.verify(
      getParentContract(),
      extraData,
      response
    );
    require(signers[signer], "SignatureVerifier: Invalid sigature");
    return result;
  }

  function supportsInterface(
    bytes4 interfaceID
  ) public view override returns (bool) {
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

  function isContractERC721(
    address contractAddress
  ) public view returns (bool) {
    return ERC165(contractAddress).supportsInterface(type(IERC721).interfaceId);
  }

  function isContractERC1155(
    address contractAddress
  ) public view returns (bool) {
    return
      ERC165(contractAddress).supportsInterface(type(IERC1155).interfaceId);
  }

  bool private requireContractOwnership = false;

  function setRequireContractOwnershipToRegister(
    bool _requireContractOwnership
  ) external onlyOwner {
    requireContractOwnership = _requireContractOwnership;
  }

  function registerContract(
    bytes32 namehash,
    address contractAddress,
    uint64[] calldata supportedCoinsFromEth
  ) external {
    if (requireContractOwnership) {
      // If so, check if the caller is the owner
      require(
        Ownable(contractAddress).owner() == msg.sender,
        "Caller not owner of contract"
      );
    }
    require(ens.owner(namehash) == msg.sender, "nameflickResolver");
    nfts[namehash] = contractAddress;
    for (uint256 i = 0; i < supportedCoinsFromEth.length; i++) {
      nftOnCoin[
        keccak256(
          abi.encode(contractAddress, uint256(supportedCoinsFromEth[i]))
        )
      ] = true;
    }
  }

  function contractForName(bytes32 name) external view returns (address) {
    return nfts[name];
  }

  function ownerOfName(
    address contractAddress,
    uint256 tokenId
  ) public view returns (address) {
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
