import { providers } from "ethers";

export function providerForChain(chainId: number) {
  return new providers.FallbackProvider([
    new providers.InfuraProvider(chainId, process.env.INFURA_API_KEY),
    new providers.AlchemyProvider(chainId, process.env.ALCHEMY_API_KEY),
  ]);
}
