#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { ImageStack } from "./image.js";
import { jsonFromNodeModules, jsonFromSecret } from "./utils/files.js";

import { WwwStack } from "./www.js";
import { NetworkStack } from "./network.js";
import { OrganizationStack } from "./organization.js";
import { Redirects } from "./redirect.js";
import { SopsStack } from "./sops.js";
import { IpfsStack } from "./ipfs.js";
import { AssetStack } from "./assets.js";
import { GraphqlStack } from "./graphql.js";
import { DynamoDB } from "./dynamodb.js";

const secretsJson = jsonFromSecret("deploy-secrets.json");
const jwtJson = jsonFromSecret("jwt-secret.json");

const app = new cdk.App();

const chainId = "11155111";

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
  nftRootCollection: secretsJson.chains["11155111"].nftRootCollection,
  nftCollectionsOfInterest: JSON.stringify(
    secretsJson.chains["1"].nftCollectionsOfInterest
  ),
  ipfsApiUrl: secretsJson.infraIpfsUrl,
  ipfsApiProject: secretsJson.infraIpfsProjectId,
  ipfsApiSecret: secretsJson.infraIpfsSecret,
  jwk: jwtJson.JWK,
  jwtPublicKey: jwtJson.publicKey,
  jwtClaimIssuer: jwtJson.issuer,
});

new ImageStack(app, "Image", {
  domain: ["image", "0xflick.com"],
  infuraIpfsAuth: `Basic ${Buffer.from(
    `${secretsJson.infraIpfsProjectId}:${secretsJson.infraIpfsSecret}`
  ).toString("base64")}`,
  env: {
    region: "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});

new IpfsStack(app, "Ipfs", {
  domain: ["ipfs", "0xflick.com"],
  infuraIpfsAuth: `Basic ${Buffer.from(
    `${secretsJson.infraIpfsProjectId}:${secretsJson.infraIpfsSecret}`
  ).toString("base64")}`,
  env: {
    region: "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
new SopsStack(app, "Sops");
new NetworkStack(app, "Network", {
  domain: "0xflick.com",
});
new Redirects(app, "Redirects", {
  env: {
    region: "us-east-2",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
new OrganizationStack(app, "Bootstrap");

new WwwStack(app, "www", {
  domain: "0xflick.com",
  graphqlApiUrl: "6kjnzpunu3.execute-api.us-east-2.amazonaws.com",
  env: {
    region: "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
