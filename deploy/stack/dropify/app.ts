#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import { jsonFromSecret } from "../utils/files.js";
import path from "path";
import { fileURLToPath } from "url";
import { FrontendStack } from "./stack.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new cdk.App();

new FrontendStack(app, "frontend-next13", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
