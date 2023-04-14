/*
 * Taken from https://github.com/ProjectOpenSea/opensea-js/blob/master/src/types.ts, with some modifications
 */

import { IMetadataAttribute } from "@0xflick/models";

/**
 * Types of asset contracts
 * Given by the asset_contract_type in the OpenSea API
 */
export enum AssetContractType {
  Fungible = "fungible",
  SemiFungible = "semi-fungible",
  NonFungible = "non-fungible",
  Unknown = "unknown",
}

// Wyvern Schemas (see https://github.com/ProjectOpenSea/wyvern-schemas)
export enum WyvernSchemaName {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC721v3 = "ERC721v3",
  ERC1155 = "ERC1155",
  LegacyEnjin = "Enjin",
  ENSShortNameAuction = "ENSShortNameAuction",
  // CryptoPunks = 'CryptoPunks'
}

// Collection fees mapping recipient address to basis points
export interface Fees {
  opensea_fees: Record<string, number>;
  seller_fees: Record<string, number>;
}

interface NumericalTraitStats {
  min: number;
  max: number;
}

interface StringTraitStats {
  [key: string]: number;
}

/**
 * Annotated asset contract with OpenSea metadata
 */
export interface OpenSeaAssetContract {
  // Name of the asset's contract
  name: string;
  // Address of this contract
  address: string;
  // Type of token (fungible/NFT)
  type: AssetContractType;
  // Wyvern Schema Name for this contract
  schema_name: WyvernSchemaName;

  // Total fee levied on sellers by this contract, in basis points
  seller_fee_basis_points: number;
  // Total fee levied on buyers by this contract, in basis points
  buyer_fee_basis_points: number;

  // Description of the contract
  description: string;
  // Contract's Etherscan / OpenSea symbol
  token_symbol: string;
  // Image for the contract
  image_url: string;
  // Object with stats about the contract
  stats?: object;
  // Array of trait types for the contract
  traits?: object[];
  // Link to the contract's main website
  external_link?: string;
  // Link to the contract's wiki, if available
  wiki_link?: string;

  collection?: OpenSeaCollection;
}

/**
 * Annotated collection with OpenSea metadata
 */
export interface OpenSeaCollection {
  // Name of the collection
  name: string;
  // Slug, used in URL
  slug: string;
  // Accounts allowed to edit this collection
  editors: string[];
  // Whether this collection is hidden from the homepage
  hidden: boolean;
  // Whether this collection is featured
  featured: boolean;
  // Date collection was created
  created_date: Date;

  // Description of the collection
  description: string;
  // Image for the collection
  image_url: string;
  // Image for the collection, large
  large_image_url: string;
  // Image for the collection when featured
  featured_image_url: string;
  // Object with stats about the collection
  stats: object;
  // Data about displaying cards
  display_data: object;
  // Address for dev fee payouts
  payout_address?: string;
  // Array of trait types for the collection
  traits: OpenSeaTraitStats;
  // Link to the collection's main website
  external_url?: string;
  // Link to the collection's Discord, if available
  discord_url?: string;
  // Link to the collection's Telegram, if available
  telegram_url?: string;
  // Link to the collection's Twitter, if available
  twitter_username?: string;
  // Link to the collection's Instagram, if available
  instagram_username?: string;
  // Link to the collection's wiki, if available
  wiki_url?: string;
  // Map of collection fees holding OpenSea and seller fees
  fees?: Fees | null;
  // rarity enabled?
  is_rarity_enabled: boolean;
  // is creator fees enforced?
  is_creator_fees_enforced: boolean;
}

export interface OpenSeaTraitStats {
  [traitName: string]: NumericalTraitStats | StringTraitStats;
}

export interface OpenSeaAsset {
  id: number;
  // ID of the asset
  token_id: string;
  // Number of times this asset has been sold
  num_sales: number;
  // Background color of the asset
  background_color: string | null;
  // URL to the asset's image
  image_url?: string | null;
  // URL to the asset's image, preview size
  image_preview_url?: string | null;
  // URL to the asset's image, thumbnail size
  image_thumbnail_url?: string | null;
  // URL to the asset's image, original size
  image_original_url?: string | null;
  // URL to the asset's animation
  animation_url?: string | null;
  // URL to the asset's animation, original size
  animation_original_url?: string | null;
  // Name of the asset
  name?: string | null;
  // Description of the asset
  description?: string | null;
  // External link for the asset
  external_link?: string | null;
  // AssetContract object for the asset
  asset_contract: OpenSeaAssetContract;
  // permalink to the asset on OpenSea
  permalink: string;
  // Collection object for the asset
  collection: OpenSeaCollection;
  // decimal value of the asset
  decimals?: number | null;
  // original token metadata
  token_metadata?: string | null;
  // is nsfw?
  is_nsfw?: boolean | null;
  // owner?
  owner?: OpenSeaAccount | null;
  // creator?
  creator?: OpenSeaAccount | null;
  // traits
  traits?: IMetadataAttribute[] | null;
  // Last sale object for the asset
  last_sale?: OpenSeaSale | null;
  // Top bid object for the asset
  top_bid?: OpenSeaBid | null;
  // Date the asset was listed for sale
  listing_date?: string | null;
  // Whether the asset supports the Wyvern protocol
  supports_wyvern?: boolean | null;
  // Rarity data for the asset
  rarity_data?: OpenSeaRarityData | null;
  // Transfer fee for the asset
  transfer_fee?: string | null;
  // Transfer fee payment token for the asset
  transfer_fee_payment_token?: OpenSeaPaymentToken | null;
  // owners (single for ERC721 and multiple for ERC1155)
  top_ownerships?: OpenSeaAccount[] | null;
}

export interface OpenSeaAccount {
  // Address of the account
  address: string;
  // User object for the account
  user?: OpenSeaUser | null;
  // Config object for the account
  config?: string | null;
  // Profile image for the account
  profile_img_url?: string | null;
}

export interface OpenSeaUser {
  // Username for the user
  username: string;
}

export interface OpenSeaSale {
  // ID of the sale
  id: number;
  // Asset object for the sale
  asset: OpenSeaAsset;
  // Account object for the seller
  seller: OpenSeaAccount;
  // Account object for the buyer
  buyer?: OpenSeaAccount | null;
  // Date the sale occurred
  created_date: string;
  // Date the sale occurred
  event_timestamp: string;
  // Total price of the sale
  total_price: string;
  // others stuff....
}

export interface OpenSeaBid {
  // ID of the bid
  id: number;
  // Account object for the bidder
  bidder: OpenSeaAccount;
  // Asset object for the bid
  asset: OpenSeaAsset;
  // Date the bid was created
  created_date: string;
  // Date the bid was created
  event_timestamp: string;
  // Amount of the bid
  amount: string;
  // others stuff....
}

export interface OpenSeaRarityData {
  // The rarity strategy string identifier. Current value will be "openrarity”.
  strategy_id: string;
  // The version of the strategy.
  strategy_version: string;
  // The rank of the asset within the collection, calculated using the rarity strategy defined by strategy_id and strategy_version.
  rank: number;
  // The rarity score of the asset, calculated using the rarity strategy defined by strategy_id and strategy_version.
  score: number;
  // The time we calculated rarity data at, as a timestamp in UTC.
  calculated_at: string;
  // The maximum rank in the collection. Ranking for an asset should be considered the out of <max_rank>.
  max_rank: number;
  // The total tokens in the collection that have non-null traits and was used to calculate rarity data.
  tokens_scored: number;
  // A dictionary of other asset features that impact rarity ranking, as returned by OpenRarity.
  ranking_features: {
    // The number of unique attributes the asset has.
    unique_attribute_count: number;
  };
}

export interface OpenSeaPaymentToken {
  // ID of the payment token
  id: number;
  // Address of the payment token
  address: string;
  // Symbol of the payment token
  symbol: string;
  // Decimals of the payment token
  decimals: number;
  // Image URL of the payment token
  image_url: string;
  // Name of the payment token
  name: string;
  // Ether price of the payment token
  eth_price: string;
  // USD price of the payment token
  usd_price: string;
}
