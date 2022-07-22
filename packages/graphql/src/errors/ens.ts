import { ApolloError } from "apollo-server-errors";
import { ErrorCode } from "@ethersproject/logger";

export enum EReason {
  UNABLE_TO_RESOLVE_ENS = "UNABLE_TO_RESOLVE_ENS",
  ETH_NOT_FOUND = "ETH_NOT_FOUND",
}

export type TReason = keyof typeof EReason;

export class EnsError extends ApolloError {
  constructor(message: string, reason: TReason, code?: ErrorCode) {
    super(message, reason);

    Object.defineProperty(this, "code", { value: code });
  }
}
