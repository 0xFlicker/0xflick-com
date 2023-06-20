import { ApolloError } from "apollo-server-errors";

export enum EReason {
  ERROR_ADDRESS_INVALID = "ERROR_ADDRESS_INVALID",
}

export type TReason = keyof typeof EReason;

export class Web3Error extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
