import "dotenv/config";
import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { goerli } from "wagmi/chains";

export default defineConfig({
  out: "src/wagmi/index.ts",
  contracts: [],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY!,
      chainId: goerli.id,
      contracts: [
        {
          name: "TestNFT",
          address: {
            [goerli.id]: "0x6cF4328f1Ea83B5d592474F9fCDC714FAAfd1574" as const,
          },
        },
        {
          name: "WrappedNFT",
          address: {
            [goerli.id]: "0x3018671f3495419636519f37FfeA85BfBe3dce0f" as const,
          },
        },
      ],
    }),
    react(),
  ],
});
