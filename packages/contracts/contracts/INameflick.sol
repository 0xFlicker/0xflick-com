// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

bytes4 constant GET_ADDR_SELECTOR = bytes4(keccak256("addr(bytes32)"));
bytes4 constant GET_ADDR_COIN_SELECTOR = bytes4(
  keccak256("addr(bytes32,uint256)")
);
bytes4 constant GET_TEXT_SELECTOR = bytes4(keccak256("text(bytes32,string)"));
bytes4 constant GET_CONTENT_HASH_SELECTOR = bytes4(
  keccak256("contenthash(bytes32)")
);

interface INameflick {
  // mapping(bytes => bytes4) public onchainResolution;
  // mapping(uint32 => bool) public serviceIdToAddress;
}
