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
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cr from "aws-cdk-lib/custom-resources";

export interface ImageProps extends cdk.StackProps {
  readonly domain: [string, string] | string;
  readonly infuraIpfsAuth: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ImageStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  constructor(scope: cdk.Stage, id: string, props: ImageProps) {
    const { domain, infuraIpfsAuth, ...rest } = props;
    super(scope, id, rest);

    // Fetch table names from SSM Parameter Store
    const urlShortenerTableArnParam = new cr.AwsCustomResource(
      this,
      "UrlShortenerTableArnParam",
      {
        onUpdate: {
          // will also be called for a CREATE event
          service: "SSM",
          action: "getParameter",
          parameters: {
            Name: "UrlShortener_TableArn",
            WithDecryption: true,
          },
          region: "us-east-2",
          physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString()), // Update physical id to always fetch the latest version
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      }
    );

    const urlShortenerTableArn =
      urlShortenerTableArnParam.getResponseField("Parameter.Value");
    const urlShortenerTable = dynamodb.Table.fromTableArn(
      this,
      "UrlShortener",
      urlShortenerTableArn
    );

    // Fetch table names from SSM Parameter Store
    const tableNamesParamResource = new cr.AwsCustomResource(
      this,
      "TableNamesParamResource",
      {
        onUpdate: {
          // will also be called for a CREATE event
          service: "SSM",
          action: "getParameter",
          parameters: {
            Name: "DynamoDB_TableNames",
          },
          region: "us-east-2",
          physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString()), // Update physical id to always fetch the latest version
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      }
    );
    const tableNamesParamValue =
      tableNamesParamResource.getResponseField("Parameter.Value");
    const tableNameParams = new ssm.StringParameter(this, "TableNamesParam", {
      parameterName: "Image_DynamoDB_TableNames",
      stringValue: tableNamesParamValue,
    });

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
    const resizerBucket = new s3.Bucket(this, "resizer-bucket", {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create the origin lambda
    const imageOriginBucketParam = new ssm.StringParameter(
      this,
      "image-origin-bucket",
      {
        allowedPattern: ".*",
        description: "The bucket name for the image origin",
        parameterName: "/edge/ImageOriginBucket",
        stringValue: resizerBucket.bucketName,
        tier: ssm.ParameterTier.STANDARD,
      }
    );
    const imageOriginIpfsAuth = new ssm.StringParameter(
      this,
      "image-origin-ipfs-auth",
      {
        allowedPattern: ".*",
        description: "The bucket name for the image origin",
        parameterName: "/edge/ImageOriginIPFSApiAuth",
        stringValue: infuraIpfsAuth,
        tier: ssm.ParameterTier.STANDARD,
      }
    );
    const imageOrigin = new cloudfront.experimental.EdgeFunction(this, "io", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../.layers/sharp-layer.zip")
      ),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(15),
      memorySize: 1536,
    });
    urlShortenerTable.grantReadData(imageOrigin);
    tableNameParams.grantRead(imageOrigin);

    const imageAccept = new cloudfront.experimental.EdgeFunction(this, "ia", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../.layers/image/accept")
      ),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(2),
      memorySize: 128,
    });

    imageOriginBucketParam.grantRead(imageOrigin);
    imageOriginIpfsAuth.grantRead(imageOrigin);
    resizerBucket.grantPut(imageOrigin);
    resizerBucket.grantRead(imageOrigin);

    const cf = new cloudfront.Distribution(this, "image-distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(resizerBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        edgeLambdas: [
          {
            functionVersion: imageAccept,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          },
          {
            functionVersion: imageOrigin,
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
      logBucket: new s3.Bucket(this, "log-image-distribution"),
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
    new cdk.CfnOutput(this, "imageBucket", {
      value: resizerBucket.bucketName,
    });
  }
}
