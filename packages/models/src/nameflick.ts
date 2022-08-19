export interface INameFlickAddresses {
  ETH?: string;
  BTC?: string;
  LTC?: string;
  DOGE?: string;
}

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
  addresses: INameFlickAddresses;
  content?: string;
  textRecord: INameFlickTextRecord;
}
