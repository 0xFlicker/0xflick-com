import { ApolloError } from "apollo-server-errors";

export enum EReason {
  USER_ALL_READY_APPROVED = "USER_ALL_READY_APPROVED",
  NO_PRESALE_ROLE_FOUND = "NO_PRESALE_ROLE_FOUND",
  NOT_TWITTER_FOLLOWING = "NOT_TWITTER_FOLLOWING",
}

export type TReason = keyof typeof EReason;

export class PresaleError extends ApolloError {
  constructor(message: string, reason: TReason, affiliate?: string) {
    super(message, reason);

    Object.defineProperty(this, "affiliate", { value: affiliate });
  }
}
