// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9 <0.9.0;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "./ITokenURIGenerator.sol";

contract ExampleTokenUri is ITokenURIGenerator {
  using Strings for uint256;

  function tokenURI(uint256 tokenId)
    external
    pure
    override
    returns (string memory)
  {
    return
      string(
        abi.encodePacked("https://example.com/token/", tokenId.toString())
      );
  }
}
