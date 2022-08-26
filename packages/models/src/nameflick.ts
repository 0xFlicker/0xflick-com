import { IMetadata } from "./metadata";

export type TNameFlickAddresses = Record<string, string | undefined>;

export interface INameFlickTextRecord {
  email?: string;
  avatar?: string;
  description?: string;
  url?: string;
  notice?: string;
  keywords?: string;
  ["com.discord"]?: string;
  ["com.github"]?: string;
  ["com.reddit"]?: string;
  ["com.twitter"]?: string;
  ["org.telegram"]?: string;
}

export interface INameFlick {
  normalized?: string;
  ttl?: number;
  ensHash: string;
  addresses: TNameFlickAddresses;
  content?: string;
  textRecord: INameFlickTextRecord;
  erc721?: string;
}

export enum ENameflickTokenStatus {
  FREE_USE = "FREE_USE",
  PERSONAL_USE = "PERSONAL_USE",
  COMMUNITY_USE = "COMMUNITY_USE",
  PREMIUM_USE = "PREMIUM_USE",
}
export type NameFlickTokenStatus = keyof typeof ENameflickTokenStatus;

export interface INameflickMetadata extends IMetadata {
  status: NameFlickTokenStatus;
  wrappedEns?: string;
  records: Record<string, INameFlick>;
}
export interface INameflickToken {
  tokenId: number;
  metadata?: INameflickMetadata;
}
