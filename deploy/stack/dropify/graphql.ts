import { fileURLToPath } from "url";
import path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
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
import { getSnsTopic, getTable, getTableNameParam } from "../utils/tables.js";

export interface ApiProps {
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
  readonly region: string;
  readonly snsRegion: string;
  readonly affiliateTable: cdk.aws_dynamodb.ITable;
  readonly urlShortenerTable: cdk.aws_dynamodb.ITable;
  readonly userNonceTable: cdk.aws_dynamodb.ITable;
  readonly rolePermissionsTable: cdk.aws_dynamodb.ITable;
  readonly rolesTable: cdk.aws_dynamodb.ITable;
  readonly userRolesTable: cdk.aws_dynamodb.ITable;
  readonly nameflickTable: cdk.aws_dynamodb.ITable;
  readonly extAuthTable: cdk.aws_dynamodb.ITable;
  readonly drinkerTable: cdk.aws_dynamodb.ITable;
  readonly metadataJobTable: cdk.aws_dynamodb.ITable;
  readonly discordMessageTopic: cdk.aws_sns.ITopic;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class GraphqlStack extends Construct {
  public readonly api: HttpApi;
  constructor(scope: Construct, id: string, props: ApiProps) {
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
      region,
      rootDomain,
      openSeaApiKey,
      twitterOauthClientSecret,
      twitterOauthClientId,
      twitterAppKey,
      twitterAppSecret,
      twitterFollowUserId,
      twitterFollowUserName,
      REPLACE__discordTestChannelId,
      discordMessageTopic,
      snsRegion,
      affiliateTable,
      urlShortenerTable,
      userNonceTable,
      rolePermissionsTable,
      rolesTable,
      userRolesTable,
      nameflickTable,
      extAuthTable,
      drinkerTable,
      metadataJobTable,
    } = props;
    super(scope, id);

    // Fetch table names from SSM Parameter Store
    const tableNamesParam = new ssm.StringParameter(this, "TableNamesParam", {
      parameterName: "Dropify_Graphql_DynamoDB_TableNames",
      stringValue: JSON.stringify({
        affiliatesTable: affiliateTable.tableName,
        userNonceTable: userNonceTable.tableName,
        nameflickTable: nameflickTable.tableName,
        rolesTable: rolesTable.tableName,
        rolesPermissionsTable: rolePermissionsTable.tableName,
        userRolesTable: userRolesTable.tableName,
        externalAuthTable: extAuthTable.tableName,
        drinkerTable: drinkerTable.tableName,
        urlShortenerTable: urlShortenerTable.tableName,
        metadataJobTable: metadataJobTable.tableName,
        region,
      }),
    });

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
      SSM_PARAM_NAME: "Dropify_Graphql_DynamoDB_TableNames",
      SSM_REGION: region,
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
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../.layers/graphql")
      ),
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
    drinkerTable.grantReadWriteData(graphqlHandler);

    tableNamesParam.grantRead(graphqlHandler);
    discordMessageTopic.grantPublish(graphqlHandler);

    const httpApi = new HttpApi(this, "http-api", {
      description: "This service serves graphql.",
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
