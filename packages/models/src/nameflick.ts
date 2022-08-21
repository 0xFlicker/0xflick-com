export type TNameFlickAddresses = Record<string, string | undefined>;

export interface INameFlickTextRecord {
  email?: string;
  avatar?: string;
  description?: string;
  ["com.discord"]?: string;
  ["com.github"]?: string;
  url?: string;
  notice?: string;
  keywords?: string;
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
}
