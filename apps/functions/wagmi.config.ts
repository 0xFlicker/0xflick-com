import "dotenv/config";
import { defineConfig } from "@wagmi/cli";
import { etherscan, actions } from "@wagmi/cli/plugins";
import { goerli, mainnet, sepolia } from "wagmi/chains";

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
            [goerli.id]: "0xD0E65bFf3612a9A5f1d620BD7245e95Cc4A7c905",
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
            [mainnet.id]: "0x6cf4328f1ea83b5d592474f9fcdc714faafd1574",
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
            [mainnet.id]: "0xf3E6DbBE461C6fa492CeA7Cb1f5C5eA660EB1B47",
          },
        },
      ],
    }),
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY,
      chainId: mainnet.id,
      contracts: [
        {
          name: "NamedLadyRenderer",
          address: {
            [mainnet.id]: "0xC7A29659c34CB2551Aec0dc589e6450aF342bf24",
            [sepolia.id]: "0xDaE12D4fB5d0A173cEf2f8C69e5Dd32280f71c9a",
          },
        },
      ],
    }),
  ],
});
