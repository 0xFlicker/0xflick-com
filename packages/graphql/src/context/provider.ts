import { defaultProviderUrl } from "@0xflick/backend";
import { providers } from "ethers";
import { ensRpcUrl } from "../utils/config";
import { jsonRpcProvider } from "../utils/providers";

export interface IProviderContext {
  defaultProvider: providers.JsonRpcProvider;
  ensProvider: providers.JsonRpcProvider;
}

export function createProviderContext() {
  const rpc = defaultProviderUrl();
  const defaultProvider = jsonRpcProvider(rpc);
  const ensProvider = jsonRpcProvider(ensRpcUrl.get());
  return {
    defaultProvider,
    ensProvider,
  };
}
