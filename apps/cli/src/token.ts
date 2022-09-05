import { authMessage, createJweRequest } from "@0xflick/models";
import { Wallet } from "ethers";
import type { GraphQLClient } from "graphql-request";
import {
  address,
  chainId,
  domain,
  expirationTimeInSeconds,
  uri,
  privateKey,
  jwtPublicKey,
} from "./config";
import { getNonce } from "./queries/nonce";
import { signIn } from "./queries/signin";

export async function login(client: GraphQLClient) {
  const nonce = await getNonce(client, address);
  const now = Date.now();
  const message = authMessage({
    address,
    chainId,
    domain,
    expirationTime: now + expirationTimeInSeconds * 1000,
    issuedAt: now,
    nonce: nonce.toString(),
    uri,
    version: "1",
  });
  const wallet = new Wallet(privateKey);
  const signature = await wallet.signMessage(message);
  const jwe = await createJweRequest(signature, nonce, jwtPublicKey);
  const token = await signIn(client, address, chainId, now, jwe);
  client.setHeader("Authorization", `Bearer ${token}`);
  return token;
}
