const { spawnSync } = require("child_process");
const path = require("path");
const withTM = require("next-transpile-modules")([]);

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

let _secretsJsonCache = null;
function getSecretsJson() {
  if (!_secretsJsonCache) {
    _secretsJsonCache = jsonFromSecret(`${deployment}/deploy-secrets.json`);
  }
  return _secretsJsonCache;
}

let _jwtJsonCache = null;
function getJwtJson() {
  if (!_jwtJsonCache) {
    _jwtJsonCache = jsonFromSecret(`${deployment}/jwt-secrets.json`);
  }
  return _jwtJsonCache;
}

let _twitterJsonCache = null;
function getTwitterJson() {
  if (!_twitterJsonCache) {
    _twitterJsonCache = jsonFromSecret(`${deployment}/twitter-secrets.json`);
  }
  return _twitterJsonCache;
}

process.env.SUPPORTED_CHAINS =
  process.env.SUPPORTED_CHAINS ||
  JSON.stringify(getSecretsJson().supportedChains);

process.env.INFURA_KEY = process.env.INFURA_KEY || getSecretsJson().infuraKey;

process.env.ALCHEMY_KEY =
  process.env.ALCHEMY_KEY || getSecretsJson().alchemyKey;

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  env: {
    LOG_LEVEL: "debug",
    SIWE_EXPIRATION_TIME_SECONDS: process.env.SIWE_EXPIRATION_TIME_SECONDS,
    NEXT_PUBLIC_JWT_CLAIM_ISSUER:
      process.env.NEXT_PUBLIC_JWT_CLAIM_ISSUER || getJwtJson().issuer,
    NEXT_PUBLIC_DEFAULT_CHAIN_ID:
      process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || "1",
    NEXT_PUBLIC_SUPPORTED_CHAINS: process.env.SUPPORTED_CHAINS,
    NEXT_PUBLIC_INFURA_KEY: process.env.INFURA_KEY,
    NEXT_PUBLIC_ALCHEMY_KEY: process.env.ALCHEMY_KEY,
    NEXT_PUBLIC_JWT_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_JWT_PUBLIC_KEY || getJwtJson().publicKey,
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME ?? "https://0xflick.com",
  },
  webpack: (config) => {
    config.externals.push("tls", "net", "fs", "path");
    return config;
  },
});

module.exports = nextConfig;
