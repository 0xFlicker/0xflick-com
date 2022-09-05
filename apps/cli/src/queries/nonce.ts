import type { GraphQLClient } from "graphql-request";
import { getSdk } from "../graphql.generated";

export async function getNonce(client: GraphQLClient, address: string) {
  const response = await getSdk(client).getNonce({ address });
  return response.nonceForAddress.nonce;
}
