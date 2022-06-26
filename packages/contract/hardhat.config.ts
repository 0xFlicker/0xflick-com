import * as dotenv from "dotenv";

import { HardhatUserConfig, task, types } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { node_url, accounts, addForkConfiguration } from "./utils/network";
import { utils } from "ethers";
import { Enumerator__factory } from "./typechain/factories/contracts";
const promiseNFT__factory = import("./typechain");

dotenv.config();

task("mint", "mint a token with a signature")
  .addParam("to", "The account to mint to", "0x0", types.string)
  .addParam("nonce", "The mint nonce", 0, types.int)
  .addOptionalParam(
    "transfer",
    "optionally, transfer to",
    undefined,
    types.string
  )
  .setAction(async ({ to, nonce, transfer }, hre) => {
    const { deployments, getNamedAccounts, network, run, ethers } = hre;
    const { signer: signerAddress } = await getNamedAccounts();
    const { NFT__factory } = await promiseNFT__factory;
    const deployment = await deployments.get("NFT");
    const signer = await ethers.getSigner(signerAddress);
    const nonceBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(nonce), 32);
    console.log(`Signer address: ${signerAddress}`);
    const message = ethers.utils.solidityPack(
      ["address", "bytes32"],
      [to, nonceBytes]
    );
    const signature = await signer.signMessage(
      // Needs to be cast to binary data, otherwise will be signed as a string
      utils.arrayify(
        // This call is the same a utils.keccak256(utils.solidityPack(...))
        message
      )
    );
    const minter = await ethers.getSigner(to);
    const contract = NFT__factory.connect(deployment.address, minter);
    const enumerator = Enumerator__factory.connect(
      (await deployments.get("Enumerator")).address,
      minter
    );
    console.log(`Minting to ${to} with nonce ${nonce}`);
    await contract.presaleMint(to, nonceBytes, 1, signature);
    if (transfer) {
      console.log(`Transferring to ${transfer}`);
      const token = await enumerator[
        "tokenOfOwnerByIndex(address,address,uint256)"
      ](contract.address, minter.address, 0);
      console.log(`Tokens: ${token}`);
      await contract["safeTransferFrom(address,address,uint256)"](
        minter.address,
        transfer,
        token
      );
    }
  });
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
    },
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
    signer: 1,
    staking: 2,
    beneficiary: 3,
    user: 4,
  },
  networks: addForkConfiguration({
    hardhat: {
      initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
      accounts: accounts("hardhat"),
      tags: ["local"],
    },
    localhost: {
      url: node_url("localhost"),
      accounts: accounts("localhost"),
      tags: ["local"],
    },
    ganache: {
      url: node_url("ganache"),
      accounts: accounts("ganache"),
      tags: ["local"],
    },
    "hardhat-node": {
      url: node_url("hardhat"),
      accounts: accounts("hardhat"),
      tags: ["local"],
    },
    sepolia: {
      url: node_url("sepolia"),
      accounts: accounts("sepolia"),
      gasPrice: utils.parseUnits("10", "gwei").toNumber(),
    },
    rinkeby: {
      url: node_url("rinkeby"),
      accounts: accounts("rinkeby"),
    },
    mainnet: {
      url: node_url("mainnet"),
      accounts: accounts("mainnet"),
    },
    kovan: {
      url: node_url("kovan"),
      accounts: accounts("kovan"),
    },
    goerli: {
      url: node_url("goerli"),
      accounts: accounts("goerli"),
      deploy: ["deploy-l1"],
    },
    maticmum: {
      url: node_url("maticmum"),
      accounts: accounts("maticmum"),
      deploy: ["deploy-l2"],
      gasPrice: utils.parseUnits("35", "gwei").toNumber(),
    },
    matic: {
      url: node_url("matic"),
      accounts: accounts("matic"),
      deploy: ["deploy-l2"],
      gasPrice: utils.parseUnits("50", "gwei").toNumber(),
    },
  }),
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    gasPrice: 30,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    // @ts-ignore this is for the verifier
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY_MAINNET || "",
      goerli: process.env.ETHERSCAN_API_KEY_GOERLI || "",
      polygonMumbai: process.env.ETHERSCAN_API_KEY_MATICMUM || "",
      polygon: process.env.ETHERSCAN_API_KEY_MATIC || "",
      rinkeby: process.env.ETHERSCAN_API_KEY_RINKEBY || "",
      sepolia: process.env.ETHERSCAN_API_KEY_SEPOLIA || "",
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};

export default config;
