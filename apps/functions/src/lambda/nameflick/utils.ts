import { providers } from "ethers";
import { RPC_URL } from "./config.js";

export function jsonRpcProvider() {
  return new providers.JsonRpcProvider(RPC_URL);
}
