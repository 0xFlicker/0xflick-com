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

const secretsJson = jsonFromSecret("deploy-secrets.json");

const app = new cdk.App();

new AssetStack(app, "Assets", {});
new GraphqlStack(app, "Graphql", {});
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
  env: {
    region: "us-east-1",
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
