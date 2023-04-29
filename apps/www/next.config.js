const path = require("path");
const withTM = require("next-transpile-modules")([
  "@0xflick/components",
  "@0xflick/feature-airdrop",
  "@0xflick/feature-auth",
  "@0xflick/feature-contract",
  "@0xflick/feature-locale",
  "@0xflick/feature-theme",
  "@0xflick/feature-web3",
  "@0xflick/backend",
  "@0xflick/models",
  "@0xflick/graphql",
  "@0xflick/contracts",
  "@0xflick/assets",
  "@0xflick/utils",
]);
const { spawnSync } = require("child_process");

/**
 * @param {string} file
 */
function jsonFromSecret(file) {
  const { stdout, stderr } = spawnSync("sops", ["--decrypt", file], {
    cwd: path.join(__dirname, "../../secrets"),
    encoding: "utf8",
  });
  if (stderr) {
    throw new Error(stderr);
  }
  return JSON.parse(stdout);
}

const deployment = process.env.DEPLOYMENT || "localhost";
const secretsJson = jsonFromSecret(`${deployment}/deploy-secrets.json`);
const jwtJson = jsonFromSecret(`${deployment}/jwt-secrets.json`);
const twitter = jsonFromSecret(`${deployment}/twitter-secrets.json`);

const INFURA_IPFS_AUTH = `Basic ${Buffer.from(
  `${secretsJson.infraIpfsProjectId}:${secretsJson.infraIpfsSecret}`
).toString("base64")}`;

if (!process.env.SUPPORTED_CHAINS) {
  process.env.SUPPORTED_CHAINS = JSON.stringify(secretsJson.supportedChains);
}

if (!process.env.IPFS_API_URL) {
  process.env.IPFS_API_URL = secretsJson.ipfsApiUrl;
}
const IPFS_API_URL = process.env.IPFS_API_URL;

if (!process.env.IPFS_API_PROJECT) {
  process.env.IPFS_API_PROJECT = secretsJson.infraIpfsProjectId;
}
const IPFS_API_PROJECT = process.env.IPFS_API_PROJECT;

if (!process.env.IPFS_API_SECRET) {
  process.env.IPFS_API_SECRET = secretsJson.infraIpfsSecret;
}
const IPFS_API_SECRET = process.env.IPFS_API_SECRET;

if (!process.env.INFURA_KEY) {
  process.env.INFURA_KEY = secretsJson.infuraKey;
}

if (!process.env.ALCHEMY_KEY) {
  process.env.ALCHEMY_KEY = secretsJson.alchemyKey;
}

if (!process.env.WEB3_RPC) {
  throw new Error("WEB3_RPC is not defined");
}
const WEB3_RPC = process.env.WEB3_RPC;

if (!process.env.ENS_RPC_URL) {
  throw new Error("ENS_RPC_URL is not defined");
}
const ENS_RPC_URL = process.env.ENS_RPC_URL;

const nameflickResolver = {
  Ethereum: secretsJson.chains["1"].nameflickResolver,
  Goerli: secretsJson.chains["5"].nameflickResolver,
};

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("tls", "net", "fs", "path", "canvas");
    return config;
  },
  env: {
    LOG_LEVEL: "debug",
    TWITTER_OAUTH_CLIENT_SECRET: twitter.TWITTER_OAUTH_CLIENT_SECRET,
    NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID:
      twitter.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID,
    TWITTER_APP_KEY: twitter.TWITTER_APP_KEY,
    TWITTER_APP_SECRET: twitter.TWITTER_APP_SECRET,
    TWITTER_FOLLOW_USER_ID: twitter.follow.userId,
    NEXT_PUBLIC_TWITTER_FOLLOW_NAME: twitter.follow.name,
    SSM_TABLE_NAMES: process.env.SSM_TABLE_NAMES,
    SSM_TABLE_NAMES_REGION: process.env.SSM_TABLE_NAMES_REGION,
    SIWE_EXPIRATION_TIME_SECONDS: process.env.SIWE_EXPIRATION_TIME_SECONDS,
    IPFS_API_URL,
    IPFS_API_PROJECT,
    IPFS_API_SECRET,
    INFURA_IPFS_AUTH,
    WEB3_RPC_URL: WEB3_RPC,
    ENS_RPC_URL,
    NEXT_PUBLIC_JWT_CLAIM_ISSUER: jwtJson.issuer,
    NEXT_PUBLIC_AXOLOTL_BASE_IMAGES:
      process.env.NEXT_PUBLIC_AXOLOTL_BASE_IMAGES,
    NEXT_PUBLIC_DEFAULT_CHAIN_ID:
      process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || "1",
    NEXT_PUBLIC_SUPPORTED_CHAINS: process.env.SUPPORTED_CHAINS,
    NEXT_PUBLIC_INFURA_KEY: process.env.INFURA_KEY,
    NEXT_PUBLIC_ALCHEMY_KEY: process.env.ALCHEMY_KEY,
    FLICK_ENS_DOMAIN: process.env.FLICK_ENS_DOMAIN,
    NEXT_PUBLIC_JWT_PUBLIC_KEY: jwtJson.publicKey,
    NEXT_PUBLIC_NAMEFLICK_RESOLVERS: JSON.stringify(nameflickResolver),
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME ?? "https://0xflick.com",
    NEXT_PUBLIC_IMAGE_RESIZER:
      process.env.NEXT_PUBLIC_IMAGE_RESIZER ?? "https://image.0xflick.com",
    NEXT_PUBLIC_IPFS:
      process.env.NEXT_PUBLIC_IPFS ?? "https://ipfs.0xflick.com",
    NFT_CONTRACT_ADDRESS: "0x73a5fb8b2faaaa7a058349cbc9563325826776bf",
    NFT_COLLECTIONS_OF_INTEREST: JSON.stringify([
      {
        address: "0x71eaa691b6e5d5e75a3ebb36d4f87cbfb23c87b0",
        name: "The Odd Dystrict",
        isEnumerable: true,
      },
      {
        address: "0x5dfeb75abae11b138a16583e03a2be17740eaded",
        name: "Hunnys",
        isEnumerable: true,
      },
      {
        address: "0xac9695369a51dad554d296885758c4af35f77e94",
        isEnumerable: false,
      },
      {
        address: "0xee55ea1f33196a8e4321c949d08489d1727defe0",
        isEnumerable: true,
      },
      {
        address: "0xbd1d2ea3127587f4ecfd271e1dadfc95320b8dea",
        isEnumerable: true,
      },
    ]),
  },
});

module.exports = nextConfig;
