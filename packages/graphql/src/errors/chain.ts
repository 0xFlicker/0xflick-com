import { ApolloError } from "apollo-server-errors";

export enum EReason {
  INVALID_CHAIN_ID = "INVALID_CHAIN_ID",
}

export type TReason = keyof typeof EReason;

export class ChainError extends ApolloError {
  constructor(message: string, reason: TReason, chainId: unknown) {
    super(message, reason);

    Object.defineProperty(this, "chainId", { value: chainId });
  }
}
