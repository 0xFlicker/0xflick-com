import * as cdk from "aws-cdk-lib";
import * as cloudtrail from "aws-cdk-lib/aws-cloudtrail";

export class OrganizationStack extends cdk.Stack {
  constructor(scope: cdk.Stage, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new cloudtrail.Trail(this, "CloudTrail");
  }
}
