import { ApolloError } from "apollo-server-errors";

export enum EReason {
  NO_PROVIDER = "NO_PROVIDER",
}

export type TReason = keyof typeof EReason;

export class TwitterError extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
