import { TProviderTypes } from "./accountProvider";

export interface IVerificationRequest {
  state: string;
  codeVerifier: string;
  provider: TProviderTypes;
  redirectUri: string;
}

export class VerificationRequestModel implements IVerificationRequest {
  public readonly state: string;
  public readonly codeVerifier: string;
  public readonly provider: TProviderTypes;
  public readonly redirectUri: string;

  constructor(other: IVerificationRequest) {
    this.state = other.state;
    this.codeVerifier = other.codeVerifier;
    this.provider = other.provider;
    this.redirectUri = other.redirectUri;
  }

  public static fromJSON(json: any): VerificationRequestModel {
    return new VerificationRequestModel(json);
  }

  public toJSON(): IVerificationRequest {
    return {
      state: this.state,
      codeVerifier: this.codeVerifier,
      provider: this.provider,
      redirectUri: this.redirectUri,
    };
  }
}
