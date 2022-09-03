import { IMetadata } from "./metadata";

export type TNameflickAddresses = Record<string, string | undefined>;

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

export interface INameflick {
  normalized?: string;
  ttl?: number;
  ensHash: string;
  addresses: TNameflickAddresses;
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
export type NameflickTokenStatus = keyof typeof ENameflickTokenStatus;

export interface INameflickTokenSettings {
  enableNft?: boolean;
  contractAddress?: string;
  tokenSubDomains?: boolean;
  tokenSubDomainsContractEditable?: boolean;
  tokenSubDomainsOwnerEditable?: boolean;
  claimableSubDomains?: boolean;
}

export interface INameflickMetadata extends IMetadata {
  status: NameflickTokenStatus;
  wrappedEns?: string;
  settings?: INameflickTokenSettings;
  records: Record<string, INameflick>;
}
export interface INameflickToken {
  tokenId: number;
  metadata?: INameflickMetadata;
}

export function subdomainFromEnsName(ensName: string): string {
  return ensName.split(".").slice(0, -2).join(".");
}

export function rootFromEnsName(ensName: string): string {
  return ensName.split(".").slice(-2).join(".");
}
