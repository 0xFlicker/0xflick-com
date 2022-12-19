// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

library BytesLib {
  function getBytes4(bytes memory b, uint256 index)
    internal
    pure
    returns (bytes4 result)
  {
    require(b.length >= index + 4, "BytesLib: index out of bounds");
    assembly {
      result := mload(add(add(b, 0x20), index))
    }
  }

  /**
   * @dev get the domain component of an ENS name, from the reverse component index
   * For example, if the name is "foo.bar.eth", getENSReverseDomainComponent(b, 0) returns "eth"
   */
  function getENSReverseDomainComponent(bytes memory b, uint256 component)
    internal
    pure
    returns (bytes memory)
  {
    // ENS names are encoded with a length prefix, followed by text and terminated with a 0 byte
    // Since we are reverse indexing, we first need to count the total number of components
    uint256 totalComponents = 0;
    uint256 i = 0;
    while (i < b.length) {
      uint256 length = uint8(b[i]);
      i += length + 1;
      totalComponents++;
    }
    // Now that we know the total number of components, we can reverse index and slice the domain component
    uint256 domainComponentIndex = totalComponents - component - 1;
    i = 0;
    while (domainComponentIndex > 0) {
      uint256 length = uint8(b[i]);
      i += length + 1;
      domainComponentIndex--;
    }
    // Finally, we can slice the domain component
    uint256 finalLength = uint8(b[i]);
    i += 1;
    bytes memory result = new bytes(finalLength);
    for (uint256 j = 0; j < finalLength; j++) {
      result[j] = b[i + j];
    }
    return result;
  }

  /**
   * @dev get the domain component of an ENS name, after the component index
   * For example, if the name is "foo.bar.eth", getENSDomainComponent(b, 1) returns "bar.eth"
   */

  function getENSDomainComponent(bytes memory b, uint256 component)
    internal
    pure
    returns (bytes memory)
  {
    // skip component entries
    uint256 i = 0;
    while (component > 0) {
      uint256 length = uint8(b[i]);
      i += length + 1;
      component--;
    }
    // slice the domain
    uint256 finalLength = b.length - i;
    bytes memory result = new bytes(finalLength);
    for (uint256 j = 0; j < finalLength; j++) {
      result[j] = b[i + j];
    }
    return result;
  }

  /**
   * @dev get the sub-domain of an ENS name
   * For example if the name is "foo.bar.eth", getENSSubdomain(b) returns "foo"
   */
  function getENSSubdomain(bytes memory b)
    internal
    pure
    returns (bytes memory)
  {
    uint256 i = 0;
    uint256 length = uint8(b[i]);
    bytes memory result = new bytes(length);
    for (uint256 j = 0; j < length; j++) {
      result[j] = b[i + j + 1];
    }
    return result;
  }

  /*
   * @dev Returns the keccak-256 hash of a byte range.
   * @param self The byte string to hash.
   * @param offset The position to start hashing at.
   * @param len The number of bytes to hash.
   * @return The hash of the byte range.
   */
  function keccak(
    bytes memory self,
    uint256 offset,
    uint256 len
  ) internal pure returns (bytes32 ret) {
    require(offset + len <= self.length);
    assembly {
      ret := keccak256(add(add(self, 32), offset), len)
    }
  }

  /**
   * @dev Returns the ENS namehash of a DNS-encoded name.
   * @param self The DNS-encoded name to hash.
   * @param offset The offset at which to start hashing.
   * @return The namehash of the name.
   */
  function namehash(bytes memory self, uint256 offset)
    internal
    pure
    returns (bytes32)
  {
    (bytes32 labelhash, uint256 newOffset) = readLabel(self, offset);
    if (labelhash == bytes32(0)) {
      require(offset == self.length - 1, "namehash: Junk at end of name");
      return bytes32(0);
    }
    return keccak256(abi.encodePacked(namehash(self, newOffset), labelhash));
  }

  /**
   * @dev Returns the keccak-256 hash of a DNS-encoded label, and the offset to the start of the next label.
   * @param self The byte string to read a label from.
   * @param idx The index to read a label at.
   * @return labelhash The hash of the label at the specified index, or 0 if it is the last label.
   * @return newIdx The index of the start of the next label.
   */
  function readLabel(bytes memory self, uint256 idx)
    internal
    pure
    returns (bytes32 labelhash, uint256 newIdx)
  {
    require(idx < self.length, "readLabel: Index out of bounds");
    uint256 len = uint256(uint8(self[idx]));
    if (len > 0) {
      labelhash = keccak(self, idx + 1, len);
    } else {
      labelhash = bytes32(0);
    }
    newIdx = idx + len + 1;
  }
}
