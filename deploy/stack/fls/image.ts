import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as route53 from "aws-cdk-lib/aws-route53";
import { fileURLToPath } from "url";
import path from "path";
import { NetworkMode } from "aws-cdk-lib/aws-ecr-assets";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ImageProps {
  readonly domain: [string, string] | string;
  readonly infuraIpfsUrl: string;
  readonly infuraIpfsAuth: string;
  readonly baseCid: string;
  readonly corsAllowedOrigins: string[];
}

export class Image extends Construct {
  readonly api: apigateway.RestApi;
  constructor(scope: Construct, id: string, props: ImageProps) {
    super(scope, id);

    const {
      corsAllowedOrigins,
      domain,
      infuraIpfsUrl,
      infuraIpfsAuth,
      baseCid,
    } = props;

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

    const storageBucket = new s3.Bucket(this, "storage", {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const flipHandler = new lambda.DockerImageFunction(this, "flip", {
      timeout: cdk.Duration.seconds(30),
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../.layers/fls-flip"),
        {
          file: "../../docker/canvas/Dockerfile",
          cmd: ["index.handler"],
          extraHash: "8",
          networkMode: NetworkMode.HOST
        }
      ),
      memorySize: 512,
      environment: {
        ASSET_BUCKET: storageBucket.bucketName,
        IMAGE_HOST: storageBucket.bucketDomainName,
        IPFS_API_URL: infuraIpfsUrl,
        IPFS_API_AUTH: infuraIpfsAuth,
        BASE_CID: baseCid,
      },
    });
    storageBucket.grantReadWrite(flipHandler);
    storageBucket.grantPutAcl(flipHandler);
    const thumbHandler = new lambda.DockerImageFunction(this, "thumb", {
      timeout: cdk.Duration.seconds(30),
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../.layers/fls-thumb"),
        {
          file: "../../docker/canvas/Dockerfile",
          cmd: ["index.handler"],
          extraHash: "8",
          networkMode: NetworkMode.HOST
        }
      ),
      memorySize: 512,
      environment: {
        ASSET_BUCKET: storageBucket.bucketName,
        IMAGE_HOST: storageBucket.bucketDomainName,
        IPFS_API_URL: infuraIpfsUrl,
        IPFS_API_AUTH: infuraIpfsAuth,
        BASE_CID: baseCid,
      },
    });
    storageBucket.grantReadWrite(thumbHandler);
    storageBucket.grantPutAcl(thumbHandler);

    const httpApi = new apigateway.RestApi(this, "fls-image-flip", {
      domainName: {
        domainName,
        certificate,
      },
    });
    const flipApiResource = httpApi.root
      .addResource("flip")
      .addResource("{tokenId}");
    flipApiResource.addCorsPreflight({
      allowOrigins: corsAllowedOrigins,
      allowMethods: ["GET"],
    });
    flipApiResource.addMethod("GET", new apigateway.LambdaIntegration(flipHandler));
    const thumbApiResource = httpApi.root
      .addResource("thumb")
      .addResource("{tokenId}");
    thumbApiResource.addCorsPreflight({
      allowOrigins: corsAllowedOrigins,
      allowMethods: ["GET"],
    });
    thumbApiResource.addMethod("GET", new apigateway.LambdaIntegration(thumbHandler));

    new cdk.CfnOutput(this, "apiUrl", {
      value: httpApi.url,
    });

    this.api = httpApi;

    new route53.ARecord(this, "ipv4-record", {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(httpApi)),
    });
    new route53.AaaaRecord(this, "ipv6-record", {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(httpApi)),
    });
  }
}
