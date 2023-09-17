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
import { getSnsTopic, getTable, getTableNameParam } from "./utils/tables.js";
import { env } from "process";

export interface ApiProps extends cdk.StackProps {
  readonly ensRpcUrl: string;
  readonly web3RpcUrl: string;
  readonly chainId: string;
  readonly chainConfig: string;
  readonly nftRootCollection: string;
  readonly nftCollectionsOfInterest: string;
  readonly ipfsApiUrl: string;
  readonly ipfsApiProject: string;
  readonly ipfsApiSecret: string;
  readonly jwk: string;
  readonly jwtPublicKey: string;
  readonly jwtClaimIssuer: string;
  readonly openSeaApiKey: string;
  readonly rootDomain: string;
  readonly twitterOauthClientSecret: string;
  readonly twitterOauthClientId: string;
  readonly twitterAppKey: string;
  readonly twitterAppSecret: string;
  readonly twitterFollowUserId: string;
  readonly twitterFollowUserName: string;
  readonly REPLACE__discordTestChannelId: string;
  readonly snsRegion: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class GraphqlStack extends cdk.Stack {
  public readonly api: HttpApi;
  constructor(scope: cdk.Stage, id: string, props: ApiProps) {
    const {
      ensRpcUrl,
      web3RpcUrl,
      chainId,
      chainConfig,
      nftCollectionsOfInterest,
      ipfsApiProject,
      ipfsApiSecret,
      ipfsApiUrl,
      nftRootCollection,
      jwk,
      jwtClaimIssuer,
      jwtPublicKey,
      rootDomain,
      openSeaApiKey,
      twitterOauthClientSecret,
      twitterOauthClientId,
      twitterAppKey,
      twitterAppSecret,
      twitterFollowUserId,
      twitterFollowUserName,
      REPLACE__discordTestChannelId,
      snsRegion,
      ...rest
    } = props;
    super(scope, id, rest);

    // Fetch table names from SSM Parameter Store
    const affiliateTable = getTable(this, "AffiliateTable", {
      globalIndexes: ["GSI1"],
    });
    const urlShortenerTable = getTable(this, "UrlShortener");
    const userNonceTable = getTable(this, "UserNonce");
    const rolePermissionsTable = getTable(this, "RolePermissions", {
      globalIndexes: ["RoleIDIndex"],
    });
    const rolesTable = getTable(this, "Roles", {
      globalIndexes: ["RolesByNameIndex"],
    });
    const userRolesTable = getTable(this, "UserRoles", {
      globalIndexes: ["RoleIDIndex", "AddressIndex"],
    });
    const nameflickTable = getTable(this, "Nameflick", {
      globalIndexes: ["GSI1", "GSI2", "GSI3"],
    });
    const extAuthTable = getTable(this, "ExternalAuth", {
      globalIndexes: ["GSI1"],
    });

    // Fetch table names from SSM Parameter Store
    const tableNamesParam = getTableNameParam(
      this,
      "Graphql_DynamoDB_TableNames"
    );

    const discordMessageTopic = getSnsTopic(
      this,
      "DiscordMessage",
      "us-east-1"
    );

    const graphqlEnv = {
      LOG_LEVEL: "debug",
      ENS_RPC_URL: ensRpcUrl,
      CHAIN_CONFIG: chainConfig,
      NFT_COLLECTIONS_OF_INTEREST: nftCollectionsOfInterest,
      NFT_CONTRACT_ADDRESS: nftRootCollection,
      WEB3_RPC_URL: web3RpcUrl,
      CHAIN_ID: chainId,
      NEXT_PUBLIC_APP_NAME: `https://${rootDomain}`,
      FLICK_ENS_DOMAIN: "0xflick.eth",
      ADMIN_ENS_DOMAIN: "0xflick.eth",
      IPFS_API_URL: ipfsApiUrl,
      IPFS_API_PROJECT: ipfsApiProject,
      IPFS_API_SECRET: ipfsApiSecret,
      NEXT_PUBLIC_IMAGE_RESIZER: `https://image.${rootDomain}`,
      NEXT_PUBLIC_IPFS: `https://ipfs.${rootDomain}`,
      SSM_PARAM_NAME: tableNamesParam.parameterName,
      SSM_REGION: "us-east-1",
      NEXT_PUBLIC_JWT_PUBLIC_KEY: jwtPublicKey,
      JWK: jwk,
      NEXT_PUBLIC_JWT_CLAIM_ISSUER: jwtClaimIssuer,
      SIWE_EXPIRATION_TIME_SECONDS: "604800",
      TWITTER_OAUTH_CLIENT_SECRET: twitterOauthClientSecret,
      NEXT_PUBLIC_TWITTER_OAUTH_CLIENT_ID: twitterOauthClientId,
      OPENSEA_API_KEY: openSeaApiKey,
      TWITTER_APP_KEY: twitterAppKey,
      TWITTER_APP_SECRET: twitterAppSecret,
      TWITTER_FOLLOW_USER_ID: twitterFollowUserId,
      NEXT_PUBLIC_TWITTER_FOLLOW_NAME: twitterFollowUserName,
      DISCORD_TESTING_CHANNEL_ID: REPLACE__discordTestChannelId,
      DISCORD_MESSAGE_TOPIC_ARN: discordMessageTopic.topicArn,
      SNS_REGION: snsRegion,
    };

    const graphqlHandler = new lambda.Function(this, "Graphql", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "../.layers/graphql")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(120),
      memorySize: 512,
      environment: graphqlEnv,
    });
    affiliateTable.grantReadWriteData(graphqlHandler);
    urlShortenerTable.grantReadWriteData(graphqlHandler);
    userNonceTable.grantReadWriteData(graphqlHandler);
    rolePermissionsTable.grantReadWriteData(graphqlHandler);
    rolesTable.grantReadWriteData(graphqlHandler);
    userRolesTable.grantReadWriteData(graphqlHandler);
    nameflickTable.grantReadWriteData(graphqlHandler);
    extAuthTable.grantReadWriteData(graphqlHandler);

    tableNamesParam.grantRead(graphqlHandler);
    discordMessageTopic.grantPublish(graphqlHandler);

    // @ts-ignore
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
    new cdk.CfnOutput(this, "tableNameParam", {
      value: tableNamesParam.parameterName,
    });
  }
}
