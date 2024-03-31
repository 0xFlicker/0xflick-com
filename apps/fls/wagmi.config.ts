import { config } from "dotenv";
import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { sepolia, mainnet } from "wagmi/chains";

config({
  path: ".env.local",
});

export default defineConfig({
  out: "src/wagmi/index.ts",
  contracts: [],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY!,
      chainId: sepolia.id,
      contracts: [
        {
          name: "BulkMinter",
          address: {
            [sepolia.id]: "0xff3cC4aDD1a4A967fDfa8D0E02472709939553c4" as const,
          },
        },
        {
          name: "WrappedNFT",
          address: {
            [sepolia.id]: "0xb4Ff1F5Efb04d5592244Ad27c99b5300208E52a6" as const,
          },
        },
      ],
    }),
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY!,
      chainId: mainnet.id,
      contracts: [
        {
          name: "FameLadySociety",
          address: {
            [mainnet.id]: "0x6cf4328f1ea83b5d592474f9fcdc714faafd1574" as const,
          },
        },
        {
          name: "FameLadySquad",
          address: {
            [mainnet.id]: "0xf3E6DbBE461C6fa492CeA7Cb1f5C5eA660EB1B47" as const,
          },
        },
      ],
    }),
    react(),
  ],
});
