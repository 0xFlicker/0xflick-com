import { Wallet } from "ethers";

if (!process.env.ENDPOINT) {
  throw new Error("Missing ENDPOINT");
}
export const endpoint = process.env.ENDPOINT;

export const privateKey = process.env.PRIVATE_KEY || "";

export const address =
  process.env.ADDRESS || (privateKey && new Wallet(privateKey).address) || "";

if (!process.env.CHAIN_ID) {
  throw new Error("Missing CHAIN_ID");
}
export const chainId = Number(process.env.CHAIN_ID);

if (!process.env.DOMAIN) {
  throw new Error("Missing DOMAIN");
}
export const domain = process.env.DOMAIN;

if (!process.env.URI) {
  throw new Error("Missing URI");
}
export const uri = process.env.URI;

if (!process.env.JWT_PUBLIC_KEY) {
  throw new Error("Missing JWT_PUBLIC_KEY");
}
export const jwtPublicKey = process.env.JWT_PUBLIC_KEY;

if (!process.env.SIWE_EXPIRATION_TIME_SECONDS) {
  throw new Error("Missing SIWE_EXPIRATION_TIME_SECONDS");
}
export const expirationTimeInSeconds = Number(
  process.env.SIWE_EXPIRATION_TIME_SECONDS
);
