import { fileURLToPath } from "url";
import path from "path";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cr from "aws-cdk-lib/custom-resources";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";

export interface ApiProps extends cdk.StackProps {
  readonly ensRpcUrl: string;
  readonly web3RpcUrl: string;
  readonly chainId: string;
  readonly nftRootCollection: string;
  readonly nftCollectionsOfInterest: string;
  readonly ipfsApiUrl: string;
  readonly ipfsApiProject: string;
  readonly ipfsApiSecret: string;
  readonly jwk: string;
  readonly jwtPublicKey: string;
  readonly jwtClaimIssuer: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class GraphqlStack extends cdk.Stack {
  public readonly api: HttpApi;
  constructor(scope: cdk.Stage, id: string, props: ApiProps) {
    const {
      ensRpcUrl,
      web3RpcUrl,
      chainId,
      nftCollectionsOfInterest,
      ipfsApiProject,
      ipfsApiSecret,
      ipfsApiUrl,
      nftRootCollection,
      jwk,
      jwtClaimIssuer,
      jwtPublicKey,
      ...rest
    } = props;
    super(scope, id, rest);

    const getTable = (
      tableName: string,
      {
        globalIndexes,
        localIndexes,
      }: { globalIndexes?: string[]; localIndexes?: string[] } = {}
    ) => {
      const tableArnParam = new cr.AwsCustomResource(
        this,
        `${tableName}ArnParam`,
        {
          onUpdate: {
            // will also be called for a CREATE event
            service: "SSM",
            action: "getParameter",
            parameters: {
              Name: `${tableName}_TableArn`,
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

      const tableArn = tableArnParam.getResponseField("Parameter.Value");
      const table = dynamodb.Table.fromTableAttributes(this, tableName, {
        tableArn,
        globalIndexes,
        localIndexes,
      });

      return table;
    };
    // Fetch table names from SSM Parameter Store
    const urlShortenerTable = getTable("UrlShortener");
    const userNonceTable = getTable("UserNonce");
    const rolePermissionsTable = getTable("RolePermissions");
    const rolesTable = getTable("Roles", {
      globalIndexes: ["RolesByNameIndex"],
    });
    const userRolesTable = getTable("UserRoles", {
      globalIndexes: ["RoleIDIndex", "AddressIndex"],
    });

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
    const tableNamesParam = new ssm.StringParameter(this, "TableNamesParam", {
      parameterName: "Graphql_DynamoDB_TableNames",
      stringValue: tableNamesParamValue,
    });
    const graphqlHandler = new lambda.Function(this, "Graphql", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../.layers/graphql")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(120),
      memorySize: 512,
      environment: {
        LOG_LEVEL: "debug",
        ENS_RPC_URL: ensRpcUrl,
        NFT_COLLECTIONS_OF_INTEREST: nftCollectionsOfInterest,
        NFT_CONTRACT_ADDRESS: nftRootCollection,
        WEB3_RPC_URL: web3RpcUrl,
        CHAIN_ID: chainId,
        NEXT_PUBLIC_APP_NAME: "0xflick.com",
        FLICK_ENS_DOMAIN: "0xflick.eth",
        IPFS_API_URL: ipfsApiUrl,
        IPFS_API_PROJECT: ipfsApiProject,
        IPFS_API_SECRET: ipfsApiSecret,
        NEXT_PUBLIC_IMAGE_RESIZER: "https://image.0xflick.com",
        NEXT_PUBLIC_IPFS: "https://ipfs.0xflick.com",
        SSM_PARAM_NAME: tableNamesParam.parameterName,
        SSM_REGION: "us-east-2",
        NEXT_PUBLIC_JWT_PUBLIC_KEY: jwtPublicKey,
        JWK: jwk,
        NEXT_PUBLIC_JWT_CLAIM_ISSUER: jwtClaimIssuer,
      },
    });
    urlShortenerTable.grantReadWriteData(graphqlHandler);
    userNonceTable.grantReadWriteData(graphqlHandler);
    rolePermissionsTable.grantReadWriteData(graphqlHandler);
    rolesTable.grantReadWriteData(graphqlHandler);
    userRolesTable.grantReadWriteData(graphqlHandler);

    tableNamesParam.grantRead(graphqlHandler);

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
    this.api = httpApi;
    new cdk.CfnOutput(this, "apiEndpoint", {
      value: httpApi.url || "",
    });
  }
}
