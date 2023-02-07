import { fileURLToPath } from "url";
import path from "path";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Cors } from "aws-cdk-lib/aws-apigateway";
import { getTable, getTableNameParam } from "./utils/tables.js";

export interface ApiProps extends cdk.StackProps {
  readonly domain: [string, string] | string;
  readonly web3RpcUrl: string;
  readonly privateKey: string;
  readonly recaptchaSecret: string;
  readonly faucetValue: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class FaucetStack extends cdk.Stack {
  constructor(scope: cdk.Stage, id: string, props: ApiProps) {
    const {
      domain,
      web3RpcUrl,
      privateKey,
      recaptchaSecret,
      faucetValue,
      ...rest
    } = props;
    super(scope, id, rest);
    // Fetch table names from SSM Parameter Store
    const drinkerTable = getTable(this, "DrinkerTable");

    // Fetch table names from SSM Parameter Store
    const tableNamesParam = getTableNameParam(
      this,
      "Faucet_DynamoDB_TableNames"
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

    const faucetHandler = new lambda.Function(this, "FaucetHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../.layers/faucet")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(5),
      memorySize: 256,
      environment: {
        LOG_LEVEL: "debug",
        RPC_URL: web3RpcUrl,
        PRIVATE_KEY: privateKey,
        SSM_PARAM_NAME: tableNamesParam.parameterName,
        SSM_REGION: "us-east-1",
        RECAPTCHA_SECRET: recaptchaSecret,
        VALUE: faucetValue,
      },
    });
    drinkerTable.grantReadWriteData(faucetHandler);
    tableNamesParam.grantRead(faucetHandler);

    const httpApi = new apigateway.RestApi(this, "Api", {});
    httpApi.addDomainName("domain", {
      domainName,
      certificate,
    });

    const resource = httpApi.root;
    resource.addMethod("POST", new apigateway.LambdaIntegration(faucetHandler));
    resource.addCorsPreflight({
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
    });

    new cdk.CfnOutput(this, "httpApi", {
      value: httpApi.url,
    });
  }
}
