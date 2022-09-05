import { ApolloError } from "apollo-server-errors";

export enum EReason {
  ROLE_NOT_FOUND = "ROLE_NOT_FOUND",
  UNABLE_TO_UNLINK_ROLE = "UNABLE_TO_UNLINK_ROLE",
}

export type TReason = keyof typeof EReason;

export class RoleError extends ApolloError {
  constructor(message: string, reason: TReason) {
    super(message, reason);
  }
}
