import { IMetadata } from "utils/metadata";

export interface IOwnedToken {
  tokenId: number;
  metadata: IMetadata;
  resizedImage: string;
}
export interface INfts {
  collectionName: string;
  ownedTokens: IOwnedToken[];
}

export class NftsModel {
  private nfts: INfts[] = [];

  constructor(nfts: INfts[]) {
    this.nfts = nfts;
  }

  public static fromJson(json: any): NftsModel {
    return new NftsModel(json);
  }

  public toJson(): any {
    return this.nfts;
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }

  public clone(): NftsModel {
    return new NftsModel([...this]);
  }

  public [Symbol.iterator]() {
    return this.nfts[Symbol.iterator]();
  }
}
