export interface IAccountUser {
  address: string;
  twitterFollower: boolean;
}

export class AccountUserModel implements IAccountUser {
  public readonly address: string;
  public readonly twitterFollower: boolean;

  constructor(other: IAccountUser) {
    this.address = other.address;
    this.twitterFollower = other.twitterFollower;
  }

  public static fromJSON(json: any): AccountUserModel {
    return new AccountUserModel(json);
  }

  public toJSON(): IAccountUser {
    return {
      address: this.address,
      twitterFollower: this.twitterFollower,
    };
  }
}
