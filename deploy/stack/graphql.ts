import { fileURLToPath } from "url";
import path from "path";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as route53 from "aws-cdk-lib/aws-route53";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";

export interface ApiProps extends cdk.StackProps {}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class GraphqlStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  constructor(scope: cdk.Stage, id: string, props: ApiProps) {
    const { ...rest } = props;
    super(scope, id, rest);

    const graphqlHandler = new lambda.Function(this, "Graphql", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../.layers/graphql")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(120),
      memorySize: 512,
      environment: {},
    });

    const httpApi = new HttpApi(this, "http-api-example", {
      description: "This service serves graphql.",
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
        ],
        allowCredentials: true,
        allowOrigins: ["http://localhost:3000"],
      },
    });
    httpApi.addRoutes({
      path: "/api/graphql",
      methods: [HttpMethod.POST, HttpMethod.GET, HttpMethod.OPTIONS],
      integration: new HttpLambdaIntegration(
        "GraphqlIntegration",
        graphqlHandler as any
      ),
    });

    new cdk.CfnOutput(this, "apiEndpoint", {
      value: httpApi.url || "",
    });
  }
}
