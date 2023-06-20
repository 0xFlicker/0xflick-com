import * as cdk from "aws-cdk-lib";
import path from "path";
import { Construct } from "constructs";
import { fileURLToPath } from "url";

import { WwwStack } from "./www.js";
import { NftMetadataBus } from "./bus.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface IProps extends cdk.StackProps {}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    const { ...rest } = props;
    super(scope, id, rest);

    // new WwwStack(this, "Www", {});
    new NftMetadataBus(this, "NftMetadataBus", {});
  }
}
