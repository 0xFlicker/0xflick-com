import { ApolloError } from "apollo-server-errors";

export enum EReason {
  METADATA_FETCH_ERROR = "METADATA_FETCH_ERROR",
}

export type TReason = keyof typeof EReason;

export class MetadataError extends ApolloError {
  constructor(message: string, reason: TReason, code?: string) {
    super(message, reason);
    Object.defineProperty(this, "code", { value: code });
  }
}
