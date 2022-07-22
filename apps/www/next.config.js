const path = require("path");
const withTM = require('next-transpile-modules')(['@0xflick/backend', '@0xflick/models', '@0xflick/graphql', '@0xflick/contracts']);
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
const INFURA_IPFS_AUTH = `Basic ${Buffer.from(
  `${secretsJson.infraIpfsProjectId}:${secretsJson.infraIpfsSecret}`
).toString("base64")}`


if (!process.env.WEB3_RPC) {
  throw new Error('WEB3_RPC is not defined')
}
const WEB3_RPC = process.env.WEB3_RPC

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  env: {
    INFURA_IPFS_AUTH,
    WEB3_RPC,
    NEXT_PUBLIC_IMAGE_RESIZER: "https://image.0xflick.com",
    NEXT_PUBLIC_IPFS: "https://ipfs.0xflick.com",
    NFT_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
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
