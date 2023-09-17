#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { jsonFromSecret } from "../utils/files.js";
import path from "path";
import { fileURLToPath } from "url";
import { FlsStack } from "./stack.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const deployment = process.env.DEPLOYMENT;
if (!deployment) {
  throw new Error("DEPLOYMENT environment variable is required");
}
const secretsJson = jsonFromSecret(`${deployment}/deploy-secrets.json`);
const jwtJson = jsonFromSecret(`${deployment}/jwt-secrets.json`);
const twitterJson = jsonFromSecret(`${deployment}/twitter-secrets.json`);
const discordJson = jsonFromSecret(`${deployment}/discord-secrets.json`);
const faucetJson = jsonFromSecret(`${deployment}/faucet-secrets.json`);

const app = new cdk.App();

const chainId = "1";
new FlsStack(
  app,
  `FLS${process.env.DEPLOYMENT_NAME ? `-${process.env.DEPLOYMENT_NAME}` : ""}`,
  {
    discordBotToken: discordJson["discord-bot-token"],
    discordAppId: discordJson["discord-app-id"],
    discordTestingGuildId: discordJson["discord-testing-guild-id"],
    discordPublicKey: discordJson["discord-public-key"],
    chainConfig: JSON.stringify(secretsJson.chains),
    domain: deployment,
    ensRpcUrl: secretsJson.chains[chainId].rpc,
    web3RpcUrl: secretsJson.chains[chainId].rpc,
    goerliRpcUrl: secretsJson.chains["5"].rpc,
    nftRootCollection: secretsJson.chains[chainId].nftRootCollection,
    nftCollectionsOfInterest: JSON.stringify(
      secretsJson.chains[chainId].nftCollectionsOfInterest
    ),
    ipfsApiProject: secretsJson.infraIpfsProjectId,
    ipfsApiSecret: secretsJson.infraIpfsSecret,
    ipfsApiUrl: secretsJson.infraIpfsUrl,
    jwk: jwtJson.JWK,
    jwtClaimIssuer: jwtJson.issuer,
    jwtPublicKey: jwtJson.publicKey,
    openSeaApiKey: secretsJson.openSeaApiKey,
    region: "us-east-1",
    twitterAppKey: twitterJson.TWITTER_APP_KEY,
    twitterAppSecret: twitterJson.TWITTER_APP_SECRET,
    twitterOauthClientId: twitterJson.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID,
    twitterOauthClientSecret: twitterJson.TWITTER_OAUTH_CLIENT_SECRET,
    twitterFollowUserId: twitterJson.follow.userId,
    twitterFollowUserName: twitterJson.follow.name,
    REPLACE__discordTestChannelId: discordJson["discord-testing-guild-id"],
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: "us-east-1",
    },
    infuraApiKey: secretsJson.infuraKey,
    alchemyApiKey: secretsJson.alchemyKey,
  }
);
