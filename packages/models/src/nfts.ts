import { IMetadata } from "./metadata";

export type IOwnedToken = {
  tokenId: number;
  metadata: IMetadata;
  resizedImage: string;
};
export interface INfts {
  collectionName: string;
  contractAddress: string;
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

  public [Symbol.iterator]() {
    return this.nfts[Symbol.iterator]();
  }
}
