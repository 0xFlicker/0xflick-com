import { fileURLToPath } from "url";
import path from "path";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as route53 from "aws-cdk-lib/aws-route53";

export interface IpfsProps extends cdk.StackProps {
  readonly domain: [string, string] | string;
  readonly infuraIpfsAuth: string;
  readonly corsAllowedOrigins: string[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class IpfsStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  constructor(scope: cdk.Stage, id: string, props: IpfsProps) {
    const { domain, infuraIpfsAuth, corsAllowedOrigins, ...rest } = props;
    super(scope, id, rest);

    // Domain
    const domains = domain instanceof Array ? domain : [domain];
    const domainName = domains.join(".");
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: domain.length === 2 ? domains[1] : domains[0],
    });

    const certificate = new acm.DnsValidatedCertificate(this, "certificate", {
      domainName,
      hostedZone: hostedZone,
      region: "us-east-1",
    });

    // Bucket with a single image
    const storageBucket = new s3.Bucket(this, "storage", {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create the origin lambda
    const ipfsOriginBucketParam = new ssm.StringParameter(
      this,
      "ipfs-origin-bucket",
      {
        allowedPattern: ".*",
        description: "The bucket name for the ipfs origin",
        parameterName: "/edge/IpfsOriginBucket",
        stringValue: storageBucket.bucketName,
        tier: ssm.ParameterTier.STANDARD,
      }
    );
    const ipfsOriginIpfsAuth = new ssm.StringParameter(
      this,
      "ipfs-origin-ipfs-auth",
      {
        allowedPattern: ".*",
        description: "The IPFS auth token",
        parameterName: "/edge/IpfsOriginIPFSApiAuth",
        stringValue: infuraIpfsAuth,
        tier: ssm.ParameterTier.STANDARD,
      }
    );
    const ipfsCorsAllowedOrigins = new ssm.StringParameter(
      this,
      "ipfs-origin-cors-allowed-origins",
      {
        allowedPattern: ".*",
        description: "The allowed CORS origins for the image distribution",
        parameterName: "/edge/IpfsCorsAllowedOrigins",
        stringValue: JSON.stringify(corsAllowedOrigins),
        tier: ssm.ParameterTier.STANDARD,
      }
    );
    const ipfsOrigin = new cloudfront.experimental.EdgeFunction(this, "ipfs", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../.layers/ipfs-origin-layer.zip")
      ),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(15),
      memorySize: 256,
    });

    ipfsOriginBucketParam.grantRead(ipfsOrigin);
    ipfsOriginIpfsAuth.grantRead(ipfsOrigin);
    ipfsCorsAllowedOrigins.grantRead(ipfsOrigin);
    storageBucket.grantReadWrite(ipfsOrigin);
    storageBucket.grantPutAcl(ipfsOrigin);

    const cf = new cloudfront.Distribution(this, "image-distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(storageBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        edgeLambdas: [
          {
            functionVersion: ipfsOrigin,
            eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
          },
        ],
        cachePolicy: new cloudfront.CachePolicy(
          this,
          "image-origin-cache-policy",
          {
            minTtl: cdk.Duration.seconds(100),
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),
            headerBehavior: cloudfront.CacheHeaderBehavior.allowList("origin"),
            enableAcceptEncodingGzip: true,
            enableAcceptEncodingBrotli: true,
          }
        ),
      },
      logBucket: new s3.Bucket(this, "log-ipfs-distribution"),
      domainNames: [domainName],
      certificate,
    });

    new route53.ARecord(this, "image-ipv4-record", {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
    });
    new route53.AaaaRecord(this, "image-ipv6-record", {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
    });
    new cdk.CfnOutput(this, domainName, {
      value: cf.distributionDomainName,
    });
    new cdk.CfnOutput(this, "ipfsBucket", {
      value: storageBucket.bucketName,
    });
  }
}
