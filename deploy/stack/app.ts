#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { ImageStack } from "./image.js";
import { jsonFromSecret } from "./utils/files.js";

import { WwwStack } from "./www.js";
import { OrganizationStack } from "./organization.js";
import { IpfsStack } from "./ipfs.js";
import { AssetStack } from "./assets.js";
import { GraphqlStack } from "./graphql.js";
import { DynamoDB } from "./dynamodb.js";
import { NameflickStack } from "./nameflick.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const deployment = process.env.DEPLOYMENT;
if (!deployment) {
  throw new Error("DEPLOYMENT environment variable is required");
}
const secretsJson = jsonFromSecret(`${deployment}/deploy-secrets.json`);
const jwtJson = jsonFromSecret(`${deployment}/jwt-secret.json`);
const twitterJson = jsonFromSecret(`${deployment}/twitter-secrets.json`);

const app = new cdk.App();

const chainId = "1";

new AssetStack(app, "Assets", {});
new DynamoDB(app, "DynamoDB", {
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT,
    region: "us-east-2",
  },
});
const { api: graphqlApi } = new GraphqlStack(app, "Graphql", {
  chainId,
  ensRpcUrl: secretsJson.chains["1"].rpc,
  web3RpcUrl: secretsJson.chains["1"].rpc,
  nftRootCollection: secretsJson.chains["1"].nftRootCollection,
  nftCollectionsOfInterest: JSON.stringify(
    secretsJson.chains["1"].nftCollectionsOfInterest
  ),
  ipfsApiUrl: secretsJson.infraIpfsUrl,
  ipfsApiProject: secretsJson.infraIpfsProjectId,
  ipfsApiSecret: secretsJson.infraIpfsSecret,
  jwk: jwtJson.JWK,
  jwtPublicKey: jwtJson.publicKey,
  jwtClaimIssuer: jwtJson.issuer,
  rootDomain: deployment,
  twitterAppKey: twitterJson.TWITTER_APP_KEY,
  twitterAppSecret: twitterJson.TWITTER_APP_SECRET,
  twitterOauthClientId: twitterJson.NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID,
  twitterOauthClientSecret: twitterJson.TWITTER_OAUTH_CLIENT_SECRET,
  twitterFollowUserId: twitterJson.follow.userId,
  twitterFollowUserName: twitterJson.follow.name,
});

new ImageStack(app, "Image", {
  domain: ["image", deployment],
  corsAllowedOrigins: [`https://${deployment}`, "http://localhost:3000"],
  infuraIpfsAuth: `Basic ${Buffer.from(
    `${secretsJson.infraIpfsProjectId}:${secretsJson.infraIpfsSecret}`
  ).toString("base64")}`,
  env: {
    region: "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  rootDomain: deployment,
});

new IpfsStack(app, "Ipfs", {
  domain: ["ipfs", deployment],
  corsAllowedOrigins: [`https://${deployment}`, "http://localhost:3000"],
  infuraIpfsAuth: `Basic ${Buffer.from(
    `${secretsJson.infraIpfsProjectId}:${secretsJson.infraIpfsSecret}`
  ).toString("base64")}`,
  env: {
    region: "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});

new OrganizationStack(app, "Bootstrap");
new NameflickStack(app, "NameflickBeta", {
  domain: ["nameflick-beta", deployment],
  privateKey: secretsJson.privateKey,
  web3RpcUrl: secretsJson.chains["1"].rpc,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
new WwwStack(app, "www", {
  domain: deployment,
  graphqlApiUrl: "45h95rp36i.execute-api.us-east-1.amazonaws.com",
  serverlessBuildOutDir: path.resolve(__dirname, "../.layers"),
  withLogging: true,
  whiteListedHeaders: ["Authorization", "Host", "Content-Type", "Accept"],
  env: {
    region: "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
