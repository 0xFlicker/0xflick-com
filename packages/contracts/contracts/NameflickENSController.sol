// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@ensdomains/ens-contracts/contracts/wrapper/ERC1155Fuse.sol";
import "@ensdomains/ens-contracts/contracts/wrapper/INameWrapper.sol";
import "@ensdomains/ens-contracts/contracts/wrapper/BytesUtil.sol";
import "./ITokenURIGenerator.sol";
import "./INameflickNFT.sol";

error LabelTooShort();
error LabelTooLong(string label);

uint32 constant NAMEFLICK_CANNOT_UNWRAP = 1;
uint32 constant NAMEFLICK_CANNOT_BURN_FUSES = 2;
uint32 constant NAMEFLICK_CANNOT_TRANSFER = 4;
uint32 constant NAMEFLICK_CANNOT_SET_RESOLVER = 8;
uint32 constant NAMEFLICK_CANNOT_SET_TTL = 16;
uint32 constant NAMEFLICK_CANNOT_CREATE_SUBDOMAIN = 32;
uint32 constant NAMEFLICK_PARENT_CANNOT_CONTROL = 64;
uint32 constant NAMEFLICK_CAN_DO_EVERYTHING = 0;

contract NameflickENSController {
  using BytesUtils for bytes;
  ENS public immutable ens;
  INameWrapper public nameWrapper;

  bytes32 private constant ETH_NODE =
    0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;
  bytes32 private constant ROOT_NODE =
    0x0000000000000000000000000000000000000000000000000000000000000000;

  uint64 private constant MAX_EXPIRY = type(uint64).max;

  constructor(ENS _ens, INameWrapper _nameWrapper) {
    ens = _ens;
    nameWrapper = _nameWrapper;
  }

  function _addLabel(string memory label, bytes memory name)
    internal
    pure
    returns (bytes memory ret)
  {
    if (bytes(label).length < 1) {
      revert LabelTooShort();
    }
    if (bytes(label).length > 255) {
      revert LabelTooLong(label);
    }
    return abi.encodePacked(uint8(bytes(label).length), label, name);
  }
}
