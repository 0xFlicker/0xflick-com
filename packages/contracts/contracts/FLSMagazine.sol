// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ERC1155} from "solady/src/tokens/ERC1155.sol";
import {LibString} from "solady/src/utils/LibString.sol";
import {OwnableRoles} from "solady/src/auth/OwnableRoles.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";

contract FLSMagazine is ERC1155, OwnableRoles, ERC2981 {
    using LibString for uint256;

    mapping(uint256 => string) private _tokenURIs;
    string private _baseURI;

    uint256 internal constant MINTER = 1 << 0;
    uint256 internal constant METADATA = 1 << 1;
    uint256 internal constant TREASURUR = 1 << 2;
    uint256 internal constant ADMIN = 1 << 3;

    constructor() ERC1155() {}

    function setDefaultRoyalty(
        address receiver,
        uint96 royaltyFraction
    ) public onlyRoles(TREASURUR) {
        _setDefaultRoyalty(receiver, royaltyFraction);
    }

    function setTokenRoyalty(
        uint256 id,
        address receiver,
        uint96 royaltyFraction
    ) public onlyRoles(TREASURUR) {
        _setTokenRoyalty(id, receiver, royaltyFraction);
    }

    function withdraw() public onlyRoles(TREASURUR) {
        payable(msg.sender).transfer(address(this).balance);
    }

    function withdrawTo(address receiver) public onlyRoles(TREASURUR) {
        payable(receiver).transfer(address(this).balance);
    }

    function setTokenURI(
        uint256 id,
        string memory _uri
    ) public onlyRoles(METADATA) {
        _tokenURIs[id] = _uri;
    }

    function setBaseURI(string memory baseURI) public onlyRoles(METADATA) {
        _baseURI = baseURI;
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyRoles(MINTER) {
        _mint(account, id, amount, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, ERC2981) returns (bool) {
        return
            ERC1155.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }

    function uri(uint256 id) public view override returns (string memory) {
        string storage tokenUri = _tokenURIs[id];
        if (bytes(tokenUri).length > 0) {
            return tokenUri;
        }
        return string(abi.encodePacked(_baseURI, id.toString()));
    }

    function callWithData(
        address to,
        uint256 value,
        bytes memory data
    ) public payable onlyRoles(ADMIN) returns (bytes memory message) {
        bool success;
        (success, message) = to.call{value: value}(data);
        require(success, "call failed");
    }
}
