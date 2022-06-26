export enum EProviderTypes {
  "TWITTER" = "TWITTER",
  "TWITTER-V1" = "TWITTER-V1",
  "DISCORD" = "DISCORD",
}

export const providerTypes = Object.values(EProviderTypes);
export type TProviderTypes = keyof typeof EProviderTypes;

export interface IAccountProvider {
  address: string;
  providerAccountId: string;
  provider: TProviderTypes;
  accessToken?: string;
  oauthV1AccessToken?: string;
  oauthV1Secret?: string;
  oauthV1Code?: string;
}

export class AccountProviderModel implements IAccountProvider {
  public readonly address: string;
  public readonly providerAccountId: string;
  public readonly provider: TProviderTypes;
  public readonly accessToken?: string;
  public readonly oauthV1AccessToken?: string;
  public readonly oauthV1Secret?: string;
  public readonly oauthV1Code?: string;

  constructor(other: IAccountProvider) {
    this.address = other.address;
    this.providerAccountId = other.providerAccountId;
    this.provider = other.provider;
    this.accessToken = other.accessToken;
    this.oauthV1AccessToken = other.oauthV1AccessToken;
    this.oauthV1Secret = other.oauthV1Secret;
    this.oauthV1Code = other.oauthV1Code;
  }

  public static fromJSON(json: any): AccountProviderModel {
    return new AccountProviderModel(json);
  }

  public toJSON(): IAccountProvider {
    return {
      address: this.address,
      providerAccountId: this.providerAccountId,
      provider: this.provider,
      accessToken: this.accessToken,
      oauthV1AccessToken: this.oauthV1AccessToken,
      oauthV1Secret: this.oauthV1Secret,
      oauthV1Code: this.oauthV1Code,
    };
  }
}
