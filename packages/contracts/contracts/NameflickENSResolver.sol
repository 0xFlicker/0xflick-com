// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/*

  _  _                               __     _       _              _     
 | \| |   __ _    _ __     ___      / _|   | |     (_)     __     | |__  
 | .` |  / _` |  | '  \   / -_)    |  _|   | |     | |    / _|    | / /  
 |_|\_|  \__,_|  |_|_|_|  \___|   _|_|_   _|_|_   _|_|_   \__|_   |_\_\  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'                                                 
*/

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
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
import "./StringLib.sol";
import "./BytesLib.sol";

// sighash of addr(bytes32)
bytes4 constant ADDR_ETH_INTERFACE_ID = 0x3b3b57de;
// sighash of addr(bytes32,uint)
bytes4 constant ADDR_INTERFACE_ID = 0xf1cb7e06;

uint256 constant COIN_TYPE_ETH = 60;

/**
 * Implements an ENS resolver that directs all queries to a CCIP read gateway.
 * Callers must implement EIP 3668 and ENSIP 10.
 */
contract NameflickENSResolver is IExtendedResolver, ERC165, Ownable {
  using StringLib for string;
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

  event NewSigners(address[] signers);
  event RemoveSigners(address[] signers);
  event EnableContractResolution(bytes32 name, address contractAddress);
  event DisableContractResolution(bytes32 name);
  event RegisterContractCoin(
    bytes32 name,
    address contractAddress,
    uint256[] coins
  );
  event UnregisterContractCoin(
    bytes32 name,
    address contractAddress,
    uint256[] coins
  );

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
    parentContract = _parentContract;
    urls = _urls;
    for (uint256 i = 0; i < _signers.length; i++) {
      signers[_signers[i]] = true;
    }
    emit NewSigners(_signers);
  }

  function addSigners(address[] memory _signers) external onlyOwner {
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
  ) internal view returns (bool success, address payable owner) {
    bytes memory result;
    (success, result) = address(nftContract).staticcall(
      abi.encodeWithSignature("ownerOf(uint256)", tokenId)
    );
    if (success) {
      owner = abi.decode(result, (address));
    }
  }

  function isCoinSupportedByNft(
    bytes32 node,
    address nftContract,
    uint256 coinId
  ) internal view returns (bool) {
    return nftOnCoin[keccak256(abi.encode(node, nftContract, coinId))];
  }

  function getParentContract() public view returns (address) {
    return parentContract == address(0) ? address(this) : parentContract;
  }

  function revertOffchainLookup(
    bytes calldata name,
    bytes calldata data
  ) internal view {
    bytes memory callData = abi.encodeWithSelector(
      IExtendedResolver.resolve.selector,
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
   * Returns the address associated with an ENS node.
   * @param coinId The coin type to query.
   * @param node The ENS node that owns the resolver.
   * @param name The DNS-encoded name to query.
   * @param data The data to pass to the resolver.
   * @param nft The NFT contract to query.
   * @return The associated address.
   */
  function addr(
    uint256 coinId,
    bytes32 node,
    bytes calldata name,
    bytes calldata data,
    address nft
  ) public view returns (address payable) {
    if (!isCoinSupportedByNft(node, nft, coinId)) {
      revertOffchainLookup(name, data);
    }
    // get the tokenID from the sub-domain label in name
    (bool success, uint256 tokenId) = name.getNodeString(0).toUint();
    if (!success) {
      revertOffchainLookup(name, data);
    }
    address payable owner;
    (success, owner) = ownerOfNft(tokenId, nft);
    if (!success) {
      revertOffchainLookup(name, data);
    }
    return owner;
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
      bytes32 node = name.getENSDomainComponent(1).namehash(0);
      if (selector == ADDR_ETH_INTERFACE_ID) {
        address owner = addr(COIN_TYPE_ETH, node, name, data, nft);
        return (addressToBytes(owner), nft);
      } else if (selector == ADDR_INTERFACE_ID) {
        // When calling addr(bytes32,uint), the second parameter is the coin ID
        // So we only return the ownerOf if the
        uint256 coinId = uint256(data.getBytes32(36));
        address owner = addr(coinId, node, name, data, nft);
        return (addressToBytes(owner), nft);
      } else if (selector == TextResolver.text.selector) {
        (, string memory textRecord) = abi.decode(data[4:], (bytes32, string));
        if (textRecord.equals("avatar")) {
          // get the tokenID from the sub-domain label in name
          string memory subdomain = name.getNodeString(0);
          (bool success, uint256 tokenId) = subdomain.toUint();

          if (!success) {
            revertOffchainLookup(name, data);
          }
          address owner;
          // Checks if the NFT is valid...
          (success, owner) = ownerOfNft(tokenId, nft);
          if (!success) {
            revertOffchainLookup(name, data);
          }
          bytes memory record = abi.encodePacked(
            "eip155:1/erc721:",
            Strings.toHexString(uint256(uint160(nft))),
            "/",
            subdomain
          );
          return (record, nft);
        }
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

  bool public requireContractOwnershipToRegister = false;

  function setRequireContractOwnershipToRegister(
    bool _requireContractOwnership
  ) external onlyOwner {
    requireContractOwnershipToRegister = _requireContractOwnership;
  }

  function registerContract(
    bytes32 namehash,
    address contractAddress,
    uint256[] calldata supportedCoinsFromEth
  ) external {
    if (requireContractOwnershipToRegister) {
      // If so, check if the caller is the owner
      require(
        Ownable(contractAddress).owner() == msg.sender,
        "Caller not owner of contract"
      );
    }
    require(ens.owner(namehash) == msg.sender, "Caller does not own ENS node");
    nfts[namehash] = contractAddress;
    emit EnableContractResolution(namehash, contractAddress);
    for (uint256 i = 0; i < supportedCoinsFromEth.length; i++) {
      nftOnCoin[
        keccak256(
          abi.encode(namehash, contractAddress, supportedCoinsFromEth[i])
        )
      ] = true;
    }
    emit RegisterContractCoin(namehash, contractAddress, supportedCoinsFromEth);
  }

  function disableContract(bytes32 namehash) external {
    require(ens.owner(namehash) == msg.sender, "Caller does not own ENS node");
    nfts[namehash] = address(0);
    emit DisableContractResolution(namehash);
  }

  function disableCoinForContract(
    bytes32 namehash,
    address contractAddress,
    uint256[] calldata coins
  ) external {
    require(ens.owner(namehash) == msg.sender, "Caller does not own ENS node");
    for (uint256 i = 0; i < coins.length; i++) {
      delete nftOnCoin[
        keccak256(abi.encode(namehash, contractAddress, coins[i]))
      ];
    }
    emit UnregisterContractCoin(namehash, contractAddress, coins);
  }
}
