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
            [goerli.id]: "0xff3cC4aDD1a4A967fDfa8D0E02472709939553c4" as const,
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
