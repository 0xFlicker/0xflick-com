export interface IAccountUser {
  address: string;
  follower: boolean;
}

export class AccountUserModel implements IAccountUser {
  public readonly address: string;
  public readonly follower: boolean;

  constructor(other: IAccountUser) {
    this.address = other.address;
    this.follower = other.follower;
  }

  public static fromJSON(json: any): AccountUserModel {
    return new AccountUserModel(json);
  }

  public toJSON(): IAccountUser {
    return {
      address: this.address,
      follower: this.follower,
    };
  }
}
