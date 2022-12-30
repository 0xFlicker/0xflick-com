// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;
/*

  _  _                               __     _       _              _     
 | \| |   __ _    _ __     ___      / _|   | |     (_)     __     | |__  
 | .` |  / _` |  | '  \   / -_)    |  _|   | |     | |    / _|    | / /  
 |_|\_|  \__,_|  |_|_|_|  \___|   _|_|_   _|_|_   _|_|_   \__|_   |_\_\  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'                                                 
*/

import "@divergencetech/ethier/contracts/crypto/SignatureChecker.sol";
import "@divergencetech/ethier/contracts/crypto/SignerManager.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@divergencetech/ethier/contracts/sales/FixedPriceSeller.sol";
import "@divergencetech/ethier/contracts/utils/Monotonic.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./INameflickNFT.sol";
import "./ITokenURIGenerator.sol";
import "@ensdomains/ens-contracts/contracts/resolvers/profiles/IExtendedResolver.sol";
import "hardhat/console.sol";

interface IExtendedResolverWithProof {
  function resolve(
    bytes memory name,
    bytes memory data
  ) external view returns (bytes memory, address);

  function resolveWithProof(
    bytes calldata response,
    bytes calldata extraData
  ) external view returns (bytes memory, address);
}

contract FlickENS is
  BaseTokenURI,
  SignerManager,
  ERC2981,
  PaymentSplitter,
  ERC721AQueryable,
  VRFConsumerBaseV2,
  INameflickNFT,
  AccessControlEnumerable,
  IExtendedResolver
{
  using EnumerableSet for EnumerableSet.AddressSet;
  using SignatureChecker for EnumerableSet.AddressSet;

  // FlickENS provides additional functionality to ENS NFTs. This stores the contractAddres of ENS
  address public ensTokenAddress;
  // Proxy to another resolver, to allow it to be swapped out
  IExtendedResolverWithProof public resolverProxy;

  // Mapping of FlickENS tokens to ENS tokens
  mapping(uint256 => bytes32) public flickToEns;

  //sale settings
  uint256 public cost = 0;
  uint256 public maxSupply = 2000;
  uint256 public preSaleMaxMintPerAccount = 10;
  uint8 public maxMint = 10;
  bool public presaleActive = false;
  bool public publicSaleActive = false;

  /*
   * Chainlink VRF randomness batch reveal
   * -------------------------------------
   *
   * The following variables are used to implement a batch reveal of Chainlink VRF
   * randomness to see the dna of the NFTs. When minting, the packed extraData of
   * ERC721A is used to store an index into the top of revealEntropy which will always
   * be zero. When randomness is requested, the request ID is used to map to the
   * index in revealEntropy of the request. When the request is fulfilled, the
   * entropy is stored in revealEntropy and a new zero entry is added to the top.
   *
   * Requesting a dna for a token that has not yet been revealed will revert with
   * a NotRevealed error. If the extraData contains an index that has been revealed,
   * then the dna will be a hash of the tokenId and the entropy.
   */
  // Array of past chainlin entropy responses and a 0 on top for a pending response
  uint256[] public revealEntropy;
  // Open requests for entropy map to an index of revealEntropy
  mapping(uint256 => uint256) private entropyRequests;
  // Chainlink V2 coordinator, used to request randomness
  VRFCoordinatorV2Interface COORDINATOR;
  // Chainlink subscriptionId of a channel that will be used to request randomness
  uint64 vrfSubscriptionId;
  // Chainlink VRF key hash used to select gas channel
  bytes32 vrfKeyHash;

  uint32 vrfCallbackGasLimit = 100000;
  uint16 vrfRequestConfirmations = 3;

  bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");

  constructor(
    string memory name,
    string memory symbol,
    string memory baseURI,
    address signer,
    address[] memory payments,
    uint256[] memory shares,
    address payable royaltyReceiver,
    address _vrfCoordinator
  )
    ERC721A(name, symbol)
    BaseTokenURI(baseURI)
    PaymentSplitter(payments, shares)
    VRFConsumerBaseV2(_vrfCoordinator)
  {
    _setDefaultRoyalty(royaltyReceiver, 500);
    signers.add(signer);
    // The tip of revealEntropy is a zero block, which is used to indicate that the reveal seed is not yet set
    revealEntropy.push(0);
    COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
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
  ) external view returns (bytes memory, address) {
    return resolverProxy.resolve(name, data);
  }

  /**
   * Callback used by CCIP read compatible clients to verify and parse the response.
   */
  function resolveWithProof(
    bytes calldata response,
    bytes calldata extraData
  ) external view returns (bytes memory, address) {
    return resolverProxy.resolveWithProof(response, extraData);
  }

  /**
    @dev Record of already-used signatures.
     */
  mapping(bytes32 => bool) public usedMessages;

  /**
    @notice Mint token.
    */
  function presaleMint(
    address to,
    bytes32 nonce,
    uint8 mintAmount,
    bytes calldata sig
  ) external payable {
    signers.requireValidSignature(
      signaturePayload(to, nonce),
      sig,
      usedMessages
    );
    require(presaleActive, "disabled");
    require(mintAmount > 0, "mint <= 0");
    require(mintAmount <= preSaleMaxMintPerAccount, "mint >= maxmint");
    require(
      (presaleMintedByAddress(to) + mintAmount) <= preSaleMaxMintPerAccount,
      "too many mints"
    );
    require(totalSupply() + mintAmount <= maxSupply, "Over supply");
    _safeMint(to, mintAmount);
    incrementPresaleCountAuxForAddress(to, mintAmount);
  }

  /**
    @notice Mint token.
    */
  function mint(address to, uint8 mintAmount) external payable {
    require(publicSaleActive, "disabled");
    require(mintAmount > 0, "mint <= 0");
    require(
      _numberMinted(msg.sender) + mintAmount <= maxMint,
      "mint >= maxmint"
    );
    require(totalSupply() + mintAmount <= maxSupply, "Over supply");
    _safeMint(to, mintAmount);
  }

  /**
  @notice Mint token.
  */
  function mintAdmin(address to) external payable onlyRole(MINTER_ROLE) {
    require(totalSupply() + 1 <= maxSupply, "Over supply");
    _safeMint(to, 1);
  }

  /**
    @dev Emitted when a FlickENS token wraps an ENS token.
     */
  event Wrapped(uint256 flickTokenId, uint256 ensTokenId);

  // /**
  //  @notice Sets the ENS token that the NFT will resolve to.
  //  @param flickTokenId The FlickENS token id to set.
  //  @param namehash The namehash of the ENS that the resolver will wrap.
  //  */
  // function wrap(uint256 flickTokenId, bytes32 namehash) external {
  //   IERC721 ensToken = IERC721(ensTokenAddress);
  //   require(ownerOf(flickTokenId) == msg.sender, "Not owner");
  //   require(
  //     ensToken.ownerOf(ensTokenId) == msg.sender,
  //     "ENS token must be owned by sender"
  //   );
  //   flickToEns[flickTokenId] = ensTokenId;
  //   emit Wrapped(flickTokenId, ensTokenId);
  // }

  // admin minting
  function gift(
    uint256[] calldata _mintAmount,
    address[] calldata recipient
  ) external onlyOwner {
    require(
      _mintAmount.length == recipient.length,
      "Provide equal mintAmount and recipients"
    );
    for (uint256 i = 0; i < recipient.length; ++i) {
      require(
        totalSupply() + _mintAmount[i] <= maxSupply,
        "Cant go over supply"
      );
      require(_mintAmount[i] > 0, "Cant mint 0");
      _safeMint(recipient[i], _mintAmount[i]);
    }
  }

  function setCost(uint256 _newCost) public onlyOwner {
    cost = _newCost;
  }

  function setMaxMint(uint8 _newmaxMint) public onlyOwner {
    maxMint = _newmaxMint;
  }

  function setMaxSupply(uint256 _newMaxSupply) public onlyOwner {
    maxSupply = _newMaxSupply;
  }

  function setPreSaleMaxMintPerAccount(
    uint256 _newPreSaleMaxMintPerAccount
  ) public onlyOwner {
    preSaleMaxMintPerAccount = _newPreSaleMaxMintPerAccount;
  }

  function setPresaleActive(bool _newPresaleActive) public onlyOwner {
    presaleActive = _newPresaleActive;
  }

  function setMintActive(bool _newMintActive) public onlyOwner {
    publicSaleActive = _newMintActive;
  }

  /**
   * @notice Returns the number of minted tokens per presale address
   */
  function presaleMintedByAddress(address to) public view returns (uint16) {
    return uint16(_getAux(to) & _OWNER_AUX_PRESALE_COMPLEMENT);
  }

  function incrementPresaleCountAuxForAddress(
    address to,
    uint16 mintAmount
  ) internal {
    // Since the count is the last 8 bits, we can just add the mint amount to the aux
    _setAux(to, _getAux(to) + mintAmount);
  }

  /**
    @notice Returns whether the address has minted with the particular nonce. If
    true, future calls to mint() with the same parameters will fail.
    @dev In production we will never issue more than a single nonce per address,
    but this allows for testing with a single address.
     */
  function alreadyMinted(
    address to,
    bytes32 nonce
  ) external view returns (bool) {
    return
      usedMessages[
        SignatureChecker.generateMessage(signaturePayload(to, nonce))
      ];
  }

  /**
    @dev Constructs the buffer that is hashed for validation with a minting
    signature.
     */
  function signaturePayload(
    address to,
    bytes32 nonce
  ) internal pure returns (bytes memory) {
    return abi.encodePacked(to, nonce);
  }

  /**
    @dev Required override to select the correct baseTokenURI.
     */
  function _baseURI()
    internal
    view
    override(BaseTokenURI, ERC721A)
    returns (string memory)
  {
    return BaseTokenURI._baseURI();
  }

  /**
    @notice If set, contract to which tokenURI() calls are proxied.
     */
  ITokenURIGenerator public renderingContract;

  /**
    @notice Sets the optional tokenURI override contract.
     */
  function setRenderingContract(
    ITokenURIGenerator _contract
  ) external onlyOwner {
    renderingContract = _contract;
  }

  /**
    @notice If renderingContract is set then returns its tokenURI(tokenId)
    return value, otherwise returns the standard baseTokenURI + tokenId.
     */
  function tokenURI(
    uint256 tokenId
  ) public view override(ERC721A, IERC721A) returns (string memory) {
    if (address(renderingContract) != address(0)) {
      return renderingContract.tokenURI(tokenId);
    }
    return super.tokenURI(tokenId);
  }

  /**
    @notice Sets the contract-wide royalty info.
     */
  function setRoyaltyInfo(
    address receiver,
    uint96 feeBasisPoints
  ) external onlyOwner {
    _setDefaultRoyalty(receiver, feeBasisPoints);
  }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    override(ERC721A, IERC721A, ERC2981, AccessControlEnumerable)
    returns (bool)
  {
    return
      interfaceId == type(IExtendedResolver).interfaceId ||
      ERC2981.supportsInterface(interfaceId) ||
      ERC721A.supportsInterface(interfaceId) ||
      AccessControlEnumerable.supportsInterface(interfaceId);
  }

  /**
   * @dev withdraws all ETH from the contract
   */
  function withdrawSplit() public onlyOwner {
    uint256 shares = totalShares();
    for (uint256 i = 0; i < shares; i++) {
      address payable wallet = payable(payee(i));
      release(wallet);
    }
  }

  /**
   * @dev sets the ENS resolver that this contract will proxy
   */
  function setEnsContract(address ensContract) public onlyOwner {
    ensTokenAddress = ensContract;
  }

  /**
   * @dev used by the deployment scripts to check if an address is already a signer to avoid setting it again
   */
  function isSigner(address signer) public view returns (bool) {
    return signers.contains(signer);
  }

  function setOffchainResolver(address _resolverProxy) public onlyOwner {
    resolverProxy = IExtendedResolverWithProof(_resolverProxy);
  }

  function dna(uint256 tokenId) public view returns (uint256) {
    uint24 seedIndex = _ownershipOf(tokenId).extraData;
    // Should not happen....remove??
    require(seedIndex < revealEntropy.length, "dna index out of bounds");
    uint256 entropy = revealEntropy[seedIndex];
    if (entropy == 0) {
      revert NotRevealed();
    }
    return uint256(keccak256(abi.encodePacked(tokenId, entropy)));
  }

  function configureChainlink(
    uint64 _vrfSubscriptionId,
    bytes32 _vrfKeyHash,
    uint32 _vrfCallbackGasLimit,
    uint16 _vrfRequestConfirmations
  ) external onlyOwner {
    vrfSubscriptionId = _vrfSubscriptionId;
    vrfKeyHash = _vrfKeyHash;
    vrfCallbackGasLimit = _vrfCallbackGasLimit;
    vrfRequestConfirmations = _vrfRequestConfirmations;
  }

  function configureChainlink(
    uint64 _vrfSubscriptionId,
    bytes32 _vrfKeyHash
  ) external onlyOwner {
    vrfSubscriptionId = _vrfSubscriptionId;
    vrfKeyHash = _vrfKeyHash;
  }

  function requestRandomWords() external onlyOwner {
    // Will revert if subscription is not set and funded.
    entropyRequests[
      COORDINATOR.requestRandomWords(
        vrfKeyHash,
        vrfSubscriptionId,
        vrfRequestConfirmations,
        vrfCallbackGasLimit,
        1
      )
      // always point an incoming request at the tail of the array
    ] = revealEntropy.length - 1;
  }

  function fulfillRandomWords(
    uint256 requestId,
    uint256[] memory randomWords
  ) internal override {
    uint256 revealIndex = entropyRequests[requestId];
    require(revealIndex == 0, "Already revealed");
    delete entropyRequests[requestId];
    revealEntropy[revealIndex] = randomWords[0];
    // add a new slot for the next entropy
    revealEntropy.push(0);
    emit Reveal(totalSupply(), randomWords[0]);
  }

  /**
   * @dev To bypass chainlink VRF for a broken channel or to save LINK in case of slow mint. Can not overwrite an existing reveal.
   */
  function ownerRevealEntropy(
    uint24 seedIndex,
    uint256 entropy
  ) public onlyOwner {
    require(revealEntropy[seedIndex] == 0, "Already revealed");
    revealEntropy[seedIndex] = entropy;
    // add a new slot for the next entropy
    revealEntropy.push(0);
    emit AdminReveal(totalSupply(), entropy);
  }

  /**
   * @dev "ExtraData" used from ERC721A to store capabilities of the token.
   */
  function _extraData(
    address from,
    address /* to */,
    uint24 previousExtraData
  ) internal view override returns (uint24) {
    if (from != address(0)) {
      // When minted, set extraData to the index of the next revealSeed
      return uint24(revealEntropy.length);
    }
    // All other cases, including burn, return the previous extraData.
    return previousExtraData;
  }

  function _startTokenId() internal pure override returns (uint256) {
    return 1;
  }
}
