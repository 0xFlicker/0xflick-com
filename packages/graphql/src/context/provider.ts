import { defaultProviderUrl, IDeployConfig } from "@0xflick/backend";
import { FlickENS__factory } from "@0xflick/contracts";
import { providers } from "ethers";
import { jsonRpcProvider } from "../utils/providers";

export interface IProviderContext {
  providerForChain: (chainId: number) => providers.JsonRpcProvider;
  ownerForChain: (chainId: number) => Promise<string>;
}

export function createProviderContext(config: IDeployConfig): IProviderContext {
  const rpc = defaultProviderUrl();
  const defaultProvider = jsonRpcProvider(rpc);
  const self = {
    providerForChain: (chainId: number) => {
      if (config.chains[chainId]) {
        const ensConfig = config.chains[chainId].ens
          ? {
              registry: config.chains[chainId].ens.registry,
            }
          : null;
        return new providers.JsonRpcProvider(
          config.chains[chainId].rpc,
          ensConfig
            ? {
                chainId,
                name: config.chains[chainId].name,
                ensAddress: ensConfig.registry,
              }
            : undefined
        );
      }
      return defaultProvider;
    },
    ownerForChain: (chainId: number) => {
      if (config.chains[chainId]) {
        const contractAddress = config.chains[chainId].nftRootCollection;
        const provider = self.providerForChain(chainId);
        const contract = FlickENS__factory.connect(contractAddress, provider);
        return contract.owner();
      }
      return null;
    },
  };
  return self;
}
