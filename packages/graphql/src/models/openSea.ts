/*
 * Taken from https://github.com/ProjectOpenSea/opensea-js/blob/master/src/types.ts, with some modifications
 */

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
}

export interface OpenSeaTraitStats {
  [traitName: string]: NumericalTraitStats | StringTraitStats;
}
