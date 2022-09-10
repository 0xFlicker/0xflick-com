import { ApolloError } from "apollo-server-errors";

export enum EReason {
  UNKNOWN_ROLE_ID = "UNKNOWN_ROLE_ID",
  UNABLE_TO_GENERATE_SLUG = "UNABLE_TO_GENERATE_SLUG",
  
}

export type TReason = keyof typeof EReason;

export class AffiliatesError extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
