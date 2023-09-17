import "dotenv/config";
import { defineConfig } from "@wagmi/cli";
import { etherscan, actions } from "@wagmi/cli/plugins";
import { goerli, mainnet } from "wagmi/chains";

export default defineConfig({
  out: "src/lambda/fls-wrapper-event/generated.ts",
  contracts: [],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY,
      chainId: goerli.id,
      contracts: [
        {
          name: "WrappedNFT",
          address: {
            [goerli.id]: "0xD0E65bFf3612a9A5f1d620BD7245e95Cc4A7c905" as const,
          },
        },
      ],
    }),
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY,
      chainId: mainnet.id,
      contracts: [
        {
          name: "FameLadySociety",
          address: {
            [mainnet.id]: "0x6cf4328f1ea83b5d592474f9fcdc714faafd1574" as const,
          },
        },
      ],
    }),
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY,
      chainId: mainnet.id,
      contracts: [
        {
          name: "FameLadySquad",
          address: {
            [mainnet.id]: "0xf3E6DbBE461C6fa492CeA7Cb1f5C5eA660EB1B47" as const,
          },
        },
      ],
    }),
    actions({
      readContract: true,
      watchContractEvent: false,
      prepareWriteContract: false,
      writeContract: false,
    }),
  ],
});
