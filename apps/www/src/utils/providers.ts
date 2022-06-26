import { providers } from "ethers";

export function jsonRpcProvider(url: string): providers.JsonRpcProvider {
  return new providers.JsonRpcProvider(url);
}
