import "dotenv/config";
import { defineConfig } from "@wagmi/cli";
import { etherscan, actions } from "@wagmi/cli/plugins";
import { goerli } from "wagmi/chains";

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
    actions({
      readContract: true,
      watchContractEvent: false,
      prepareWriteContract: false,
      writeContract: false,
    }),
  ],
});
