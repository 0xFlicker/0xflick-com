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
          name: "BulkMinter",
          address: {
            [goerli.id]: "0xb4Ff1F5Efb04d5592244Ad27c99b5300208E52a6" as const,
          },
        },
        {
          name: "WrappedNFT",
          address: {
            [goerli.id]: "0xD0E65bFf3612a9A5f1d620BD7245e95Cc4A7c905" as const,
          },
        },
      ],
    }),
    react(),
  ],
});
