import { config} from "dotenv";
import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { goerli, mainnet } from "wagmi/chains";

config({
  path: ".env.local",
});

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
    react({
      useContractEvent: false,
      useContractItemEvent: false,
    }),
  ],
});
