import path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as logs from "aws-cdk-lib/aws-logs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as patterns from "aws-cdk-lib/aws-route53-patterns";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { fileURLToPath } from "url";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Nextjs } from "cdk-nextjs-standalone";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface IProps {}

export class WwwStack extends Construct {
  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const site = new Nextjs(this, "Web", {
      nextjsPath: "../apps/dropify",
      // @ts-ignore
      cachePolicies: {
        staticCachePolicy: cloudfront.CachePolicy.fromCachePolicyId(
          this,
          "StaticCachePolicy",
          "bbf3334f-b57d-4616-87c6-871004348b7c"
        ),
        imageCachePolicy: cloudfront.CachePolicy.fromCachePolicyId(
          this,
          "ImageCachePolicy",
          "ecf10216-f3ba-470d-9774-fdc8d2058d76"
        ),
        lambdaCachePolicy: cloudfront.CachePolicy.fromCachePolicyId(
          this,
          "LambdaCachePolicy",
          "3082ffd0-5277-44e7-9daa-8abb880a2f26"
        ),
      },
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: site.url,
    });
  }
}
