import * as cdk from "aws-cdk-lib";
import * as distribution from "aws-cdk-lib/aws-cloudfront";
import * as ccm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as targets from "aws-cdk-lib/aws-route53-targets";

export class Redirects extends cdk.Stack {
  constructor(scope: cdk.Stage, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: "0xflick.com",
    });
    const certificate = new ccm.DnsValidatedCertificate(this, "certificate", {
      domainName: "faucet.0xflick.com",
      hostedZone,
      region: "us-east-1",
    });
    const stubBucket = new s3.Bucket(this, "StubBucket");
    const dist = new distribution.Distribution(this, "faucet", {
      domainNames: ["faucet.0xflick.com"],
      certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(stubBucket),
        edgeLambdas: [
          {
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
            functionVersion: new cloudfront.experimental.EdgeFunction(
              this,
              "Redirect",
              {
                code: lambda.Code.fromAsset("stack/edge/faucetRedirect"),
                handler: "index.handler",
                runtime: lambda.Runtime.NODEJS_16_X,
              }
            ),
          },
        ],
      },
    });
    new route53.ARecord(this, "ipv4-record", {
      zone: hostedZone,
      recordName: "faucet.0xflick.com",
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(dist)
      ),
    });
    new route53.AaaaRecord(this, "ipv6-record", {
      zone: hostedZone,
      recordName: "faucet.0xflick.com",
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(dist)
      ),
    });
  }
}
