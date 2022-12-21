import { ApolloError } from "apollo-server-errors";

export enum EReason {
  ERROR_OPENSEA_NO_COLLECTION_FOUND_FOR_ASSET = "ERROR_OPENSEA_NO_COLLECTION_FOUND_FOR_ASSET",
}

export type TReason = keyof typeof EReason;

export class OpenSeaError extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
