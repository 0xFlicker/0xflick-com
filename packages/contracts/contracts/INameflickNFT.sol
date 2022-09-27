// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "erc721a/contracts/extensions/IERC721AQueryable.sol";
import "erc721a/contracts/IERC721A.sol";

bytes4 constant GET_ADDR_SELECTOR = bytes4(keccak256("addr(bytes32)"));
bytes4 constant GET_ADDR_COIN_SELECTOR = bytes4(
  keccak256("addr(bytes32,uint256)")
);
bytes4 constant GET_TEXT_SELECTOR = bytes4(keccak256("text(bytes32,string)"));
bytes4 constant GET_CONTENT_HASH_SELECTOR = bytes4(
  keccak256("contenthash(bytes32)")
);

// Using ERC721A owner aux to track presale count
uint32 constant OWNER_AUX_PRESALE_BITPOS = 48;
uint64 constant _OWNER_AUX_PRESALE_COMPLEMENT = (1 << 48) - 1;

interface INameflickNFT is IERC721A, IERC721AQueryable {
  error NotRevealed();

  event Reveal(uint256 uptoTokenId, uint256 entropy);
  event AdminReveal(uint256 uptoTokenId, uint256 entropy);
}
