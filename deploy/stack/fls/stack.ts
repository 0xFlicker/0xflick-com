import * as cdk from "aws-cdk-lib";
import path from "path";
import { Construct } from "constructs";
import { fileURLToPath } from "url";

import { GraphqlStack } from "./graphql.js";
import { DynamoDB } from "./dynamodb.js";
import { WwwStack } from "./www.js";
import { DiscordStack } from "./discord.js";
import { IpfsStack } from "./ipfs.js";
import { Image } from "./image.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface IProps extends cdk.StackProps {
  domain: string;
  region: string;
  ensRpcUrl: string;
  web3RpcUrl: string;
  goerliRpcUrl: string;
  nftRootCollection: string;
  nftCollectionsOfInterest: string;
  chainConfig: string;
  ipfsApiUrl: string;
  ipfsApiProject: string;
  ipfsApiSecret: string;
  jwk: string;
  jwtPublicKey: string;
  jwtClaimIssuer: string;
  openSeaApiKey: string;
  twitterAppKey: string;
  twitterAppSecret: string;
  twitterOauthClientId: string;
  twitterOauthClientSecret: string;
  twitterFollowUserId: string;
  twitterFollowUserName: string;
  REPLACE__discordTestChannelId: string;
  discordBotToken: string;
  discordAppId: string;
  discordTestingGuildId: string;
  discordPublicKey: string;
}

export class FlsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    const {
      domain,
      region,
      ensRpcUrl,
      web3RpcUrl,
      goerliRpcUrl,
      nftRootCollection,
      nftCollectionsOfInterest,
      chainConfig,
      ipfsApiUrl,
      ipfsApiProject,
      ipfsApiSecret,
      jwk,
      jwtPublicKey,
      jwtClaimIssuer,
      openSeaApiKey,
      twitterAppKey,
      twitterAppSecret,
      twitterOauthClientId,
      twitterOauthClientSecret,
      twitterFollowUserId,
      twitterFollowUserName,
      REPLACE__discordTestChannelId,
      discordBotToken,
      discordAppId,
      discordTestingGuildId,
      discordPublicKey,
      ...rest
    } = props;
    super(scope, id, rest);

    const chainId = "1";
    // if domain is "foo.bar.example.com", domainArray is ["foo.bar", "example.com"]
    // first find the domain and tld
    const domainArray = domain.split(".");
    const tld = domainArray.pop();
    const domainWithoutTld = domainArray.pop();
    const subDomain = domainArray.join(".");
    let wwwDomain: string | [string, string] = domain;
    if (subDomain.length) {
      wwwDomain = [subDomain, [domainWithoutTld, tld].join(".")];
    }
    const discordDomain: [string, string] = subDomain.length
      ? [`discord.${subDomain}`, [domainWithoutTld, tld].join(".")]
      : ["discord", domain];
    const ipfsDomain: [string, string] = subDomain.length
      ? [`ipfs.${subDomain}`, [domainWithoutTld, tld].join(".")]
      : ["ipfs", domain];
    const imageDomain: [string, string] = subDomain.length
      ? [`img.${subDomain}`, [domainWithoutTld, tld].join(".")]
      : ["img", domain];
    console.log("Image domain:", imageDomain);

    new IpfsStack(this, "IPFS", {
      domain: ipfsDomain,
      corsAllowedOrigins: [
        `https://${process.env.DEPLOYMENT}`,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:9000",
      ],
      infuraIpfsAuth: `Basic ${Buffer.from(
        `${ipfsApiProject}:${ipfsApiSecret}`
      ).toString("base64")}`,
    });

    new Image(this, "Image", {
      domain: imageDomain,
      baseCid: "QmTngWTnURuyiz1gtoY33FKghCiU2uQusXpnUc36QJNKsY",
      infuraIpfsAuth: `Basic ${Buffer.from(
        `${ipfsApiProject}:${ipfsApiSecret}`
      ).toString("base64")}`,
      infuraIpfsUrl: ipfsApiUrl,
      corsAllowedOrigins: [
        `https://${process.env.DEPLOYMENT}`,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:9000",
      ],
    });

    const {
      affiliateTable,
      drinkerTable,
      externalAuthTable,
      nameflickTable,
      rolesPermissionsTable,
      rolesTable,
      urlShortenerTable,
      userNonceTable,
      userRolesTable,
      lastWrapperEventBlock,
    } = new DynamoDB(this, "DynamoDB", {
      region,
    });

    const { discordMessageTopic } = new DiscordStack(this, "Discord", {
      discordDomain,
      discordBotToken,
      discordAppId,
      discordTestingGuildId,
      discordPublicKey,
      region,
      goerliRpc: goerliRpcUrl,
      mainnetRpc: web3RpcUrl,
      lastWrapperEventBlock: lastWrapperEventBlock,
    });

    const { api: graphqlApi } = new GraphqlStack(this, "Graphql", {
      chainId,
      chainConfig,
      rootDomain: domain,
      ensRpcUrl,
      ipfsApiProject,
      ipfsApiSecret,
      ipfsApiUrl,
      jwk,
      jwtClaimIssuer,
      jwtPublicKey,
      nftCollectionsOfInterest,
      discordMessageTopic,
      nftRootCollection,
      openSeaApiKey,
      twitterAppKey,
      twitterAppSecret,
      twitterFollowUserId,
      twitterFollowUserName,
      twitterOauthClientId,
      twitterOauthClientSecret,
      REPLACE__discordTestChannelId,
      web3RpcUrl,
      snsRegion: "us-east-1",
      affiliateTable,
      drinkerTable,
      extAuthTable: externalAuthTable,
      nameflickTable,
      rolePermissionsTable: rolesPermissionsTable,
      rolesTable,
      urlShortenerTable,
      userNonceTable,
      userRolesTable,
      region,
    });

    new WwwStack(this, "www", {
      domain: wwwDomain,
      region,
      affiliateTable,
      externalAuthTable,
      graphqlApi,
      withLogging: true,
      whiteListedHeaders: ["Authorization", "Host", "Content-Type", "Accept"],
      serverlessBuildOutDir: path.resolve(__dirname, "../../.layers"),
    });
  }
}
