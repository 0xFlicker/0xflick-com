import { fileURLToPath } from "url";
import path from "path";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { getTable, getTableNameParam } from "./utils/tables.js";
import { Cors } from "aws-cdk-lib/aws-apigateway";

export interface ApiProps extends cdk.StackProps {
  readonly domain: [string, string] | string;
  readonly web3RpcUrl: string;
  readonly privateKey: string;
  readonly ftToken: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class NameflickStack extends cdk.Stack {
  constructor(scope: cdk.Stage, id: string, props: ApiProps) {
    const { domain, web3RpcUrl, privateKey, ftToken, ...rest } = props;
    super(scope, id, rest);

    // Fetch table names from SSM Parameter Store
    const nameflickTable = getTable(this, "Nameflick", {
      globalIndexes: ["GSI1", "GSI2", "GSI3"],
    });

    // Fetch table names from SSM Parameter Store
    const tableNamesParam = getTableNameParam(
      this,
      "Nameflick_DynamoDB_TableNames"
    );

    // Domain
    const domains = domain instanceof Array ? domain : [domain];
    const domainName = domains.join(".");
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: domain.length === 2 ? domains[1] : domains[0],
    });

    const certificate = new acm.DnsValidatedCertificate(this, "certificate", {
      domainName,
      hostedZone: hostedZone,
    });

    const nameflickHandler = new lambda.Function(this, "NameflickHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../.layers/nameflick")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(5),
      memorySize: 256,
      environment: {
        LOG_LEVEL: "debug",
        RPC_URL: web3RpcUrl,
        PRIVATE_KEY: privateKey,
        SSM_PARAM_NAME: tableNamesParam.parameterName,
        SSM_REGION: "us-east-1",
        ENS_REGISTRAR_ADDRESS: "0x1bdf895bB48841e5556b3324be5E6481992069E6",
        FT_TOKEN: ftToken,
      },
    });
    nameflickTable.grantReadWriteData(nameflickHandler);
    tableNamesParam.grantRead(nameflickHandler);

    const httpApi = new apigateway.RestApi(this, "Api", {});
    httpApi.addDomainName("domain", {
      domainName,
      certificate,
    });
    const senderResource = httpApi.root.addResource("{sender}");
    const callDataResource = senderResource.addResource("{callData}");
    callDataResource.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
    });
    callDataResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(nameflickHandler)
    );
    callDataResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(nameflickHandler)
    );

    new cdk.CfnOutput(this, "httpApi", {
      value: httpApi.url,
    });

    new route53.ARecord(this, "CustomDomainAliasRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayDomain(httpApi.domainName as any)
      ),
      recordName: domainName,
    });
  }
}
