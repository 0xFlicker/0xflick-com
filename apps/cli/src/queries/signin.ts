import type { GraphQLClient } from "graphql-request";
import { getSdk } from "../graphql.generated";

export async function signIn(
  client: GraphQLClient,
  address: string,
  chainId: number,
  issuedAt: number,
  jwe: string
) {
  const response = await getSdk(client).signIn({
    address,
    chainId,
    issuedAt: issuedAt.toString(),
    jwe,
  });
  return response.signIn.token;
}
