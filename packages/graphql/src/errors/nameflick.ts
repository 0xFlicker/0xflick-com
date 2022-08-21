import { ApolloError } from "apollo-server-errors";

export enum EReason {
  NOT_AUTHORIZED_TO_UPDATE_NAMEFLICK = "NOT_AUTHORIZED_TO_UPDATE_NAMEFLICK",
}

export type TReason = keyof typeof EReason;

export class NameflickError extends ApolloError {
  constructor(message: string, reason: TReason, domain?: string) {
    super(message, reason);

    Object.defineProperty(this, "domain", { value: domain });
  }
}
