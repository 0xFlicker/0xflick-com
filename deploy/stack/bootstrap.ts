import * as cdk from "aws-cdk-lib";
import { NetworkStack } from "./network.js";
import { SopsStack } from "./sops.js";

const app = new cdk.App();

new SopsStack(app, "Sops");
new NetworkStack(app, "Network", {
  domain: "nameflick.com",
});
