// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

library StringToUintLib {
  function toUint(string memory s)
    internal
    pure
    returns (bool success, uint256 result)
  {
    bytes memory b = bytes(s);
    uint256 i = 0;
    for (i = 0; i < b.length; i++) {
      uint256 c = uint256(uint8(b[i]));
      if (c >= 48 && c <= 57) {
        result = result * 10 + (c - 48);
        success = true;
      } else {
        return (false, 0);
      }
    }
    return (success, result);
  }
}
