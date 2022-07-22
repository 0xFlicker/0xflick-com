import { ApolloError } from "apollo-server-errors";
import { ErrorCode } from "@ethersproject/logger";

export enum EReason {
  ERROR_CONTRACT_REVERTED_DURING_READ = "ERROR_CONTRACT_REVERTED_DURING_READ",
  ERROR_CONTRACT_REVERTED_DURING_WRITE = "ERROR_CONTRACT_REVERTED_DURING_WRITE",
}

export type TReason = keyof typeof EReason;

export class ContractError extends ApolloError {
  constructor(message: string, reason: TReason, code: ErrorCode) {
    super(message, reason);

    Object.defineProperty(this, "code", { value: code });
  }
}
