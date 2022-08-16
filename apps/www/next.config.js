const path = require("path");
const withTM = require('next-transpile-modules')(['@0xflick/backend', '@0xflick/models', '@0xflick/graphql', '@0xflick/contracts', '@0xflick/assets']);
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

const secretsJson = jsonFromSecret("deploy-secrets.json");
const jwtJson = jsonFromSecret("jwt-secret.json");
const twitter = jsonFromSecret("twitter-secrets.json");

const INFURA_IPFS_AUTH = `Basic ${Buffer.from(
  `${secretsJson.infraIpfsProjectId}:${secretsJson.infraIpfsSecret}`
).toString("base64")}`


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

if (!process.env.WEB3_RPC) {
  throw new Error('WEB3_RPC is not defined')
}
const WEB3_RPC = process.env.WEB3_RPC


if (!process.env.ENS_RPC_URL) {
  throw new Error('ENS_RPC_URL is not defined')
}
const ENS_RPC_URL = process.env.ENS_RPC_URL;

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("canvas");
    return config;
  },
  env: {
    LOG_LEVEL: "debug",
    TWITTER_OAUTH_CLIENT_SECRET: twitter.TWITTER_OAUTH_CLIENT_SECRET,
    NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID: twitter.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID,
    TWITTER_APP_KEY: twitter.TWITTER_APP_KEY,
    TWITTER_APP_SECRET: twitter.TWITTER_APP_SECRET,
    TWITTER_FOLLOW_USER_ID: twitter.follow.userId,
    NEXT_PUBLIC_TWITTER_FOLLOW_NAME: twitter.follow.name,
    SSM_TABLE_NAMES: process.env.SSM_TABLE_NAMES,
    SSM_TABLE_NAMES_REGION: process.env.SSM_TABLE_NAMES_REGION,
    IPFS_API_URL,
    IPFS_API_PROJECT,
    IPFS_API_SECRET,
    INFURA_IPFS_AUTH,
    WEB3_RPC_URL: WEB3_RPC,
    ENS_RPC_URL,
    NEXT_PUBLIC_JWT_CLAIM_ISSUER: jwtJson.issuer,
    NEXT_PUBLIC_APP_NAME: "0xflick.com",
    NEXT_PUBLIC_AXOLOTL_BASE_IMAGES: process.env.NEXT_PUBLIC_AXOLOTL_BASE_IMAGES,
    NEXT_PUBLIC_DEFAULT_CHAIN_ID: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || "1",
    NEXT_PUBLIC_DEFAULT_CHAIN_NAME: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_NAME || "mainnet",
    FLICK_ENS_DOMAIN: process.env.FLICK_ENS_DOMAIN,
    NEXT_PUBLIC_JWT_PUBLIC_KEY: jwtJson.publicKey,
    NEXT_PUBLIC_IMAGE_RESIZER: "https://image.0xflick.com",
    NEXT_PUBLIC_IPFS: "https://ipfs.0xflick.com",
    NFT_CONTRACT_ADDRESS: "0x73a5fb8b2faaaa7a058349cbc9563325826776bf",
    NFT_COLLECTIONS_OF_INTEREST: JSON.stringify([{
      address: "0x71eaa691b6e5d5e75a3ebb36d4f87cbfb23c87b0",
      name: "The Odd Dystrict",
      isEnumerable: true,
    }, {
      address: "0x5dfeb75abae11b138a16583e03a2be17740eaded",
      name: "Hunnys",
      isEnumerable: true,
    }, {
      address: "0xac9695369a51dad554d296885758c4af35f77e94",
      isEnumerable: false,
    }, {
      address: "0xee55ea1f33196a8e4321c949d08489d1727defe0",
      isEnumerable: true,
    }, {
      address: "0xbd1d2ea3127587f4ecfd271e1dadfc95320b8dea",
      isEnumerable: true,
    }]),
  }
})

module.exports = nextConfig
