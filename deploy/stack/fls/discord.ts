import { fileURLToPath } from "url";
import path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as eventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as eventTargets from "aws-cdk-lib/aws-events-targets";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as events from "aws-cdk-lib/aws-events";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { CfnOutput } from "aws-cdk-lib";

export interface DiscordProps {
  readonly discordDomain: [string, string] | string;
  readonly discordAppId: string;
  readonly discordPublicKey: string;
  readonly discordBotToken: string;
  readonly discordTestingGuildId: string;
  readonly region: string;
  readonly lastWrapperEventBlock: dynamodb.ITable;
  readonly mainnetRpc: string;
  readonly goerliRpc: string;
  readonly infuraApiKey: string;
  readonly alchemyApiKey: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DiscordStack extends Construct {
  readonly discordMessageTopic: cdk.aws_sns.Topic;
  constructor(scope: Construct, id: string, props: DiscordProps) {
    const {
      discordDomain,
      discordPublicKey,
      discordAppId,
      discordBotToken,
      discordTestingGuildId,
      region,
      lastWrapperEventBlock,
      mainnetRpc,
      goerliRpc,
      infuraApiKey,
      alchemyApiKey,
    } = props;
    super(scope, id);

    const deferredMessageQueue = new sqs.Queue(this, "DeferredMessageQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
      retentionPeriod: cdk.Duration.days(1),
    });
    const deferredMessageTopic = new sns.Topic(this, "DeferredMessageTopic");
    this.discordMessageTopic = deferredMessageTopic;
    deferredMessageTopic.addSubscription(
      new subs.SqsSubscription(deferredMessageQueue)
    );
    const discordHandler = new lambda.Function(this, "DiscordLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../.layers/discord-interaction")
      ),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        DISCORD_PUBLIC_KEY: discordPublicKey,
        DISCORD_BOT_TOKEN: discordBotToken,
        DISCORD_TESTING_CHANNEL_ID: discordTestingGuildId,
        LOG_LEVEL: "INFO",
        DISCORD_DEFERRED_MESSAGE_TOPIC_ARN: deferredMessageTopic.topicArn,
      },
    });

    deferredMessageTopic.grantPublish(discordHandler);

    new lambda.Function(this, "deferredMessageHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../.layers/discord-deferred")
      ),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        DISCORD_APPLICATION_ID: discordAppId,
        DISCORD_PUBLIC_KEY: discordPublicKey,
        DISCORD_BOT_TOKEN: discordBotToken,
        DISCORD_TESTING_CHANNEL_ID: discordTestingGuildId,
        LOG_LEVEL: "debug",
      },
      events: [
        new eventSources.SqsEventSource(deferredMessageQueue, {
          batchSize: 10,
        }),
      ],
    });

    const wrappedEventListener = new lambda.Function(
      this,
      "wrappedEventListener",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../.layers/fls-wrapper-event")
        ),
        handler: "index.handler",
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        environment: {
          DISCORD_APPLICATION_ID: discordAppId,
          DISCORD_PUBLIC_KEY: discordPublicKey,
          DISCORD_BOT_TOKEN: discordBotToken,
          DISCORD_CHANNEL_ID: discordTestingGuildId,
          DISCORD_MESSAGE_TOPIC_ARN: deferredMessageTopic.topicArn,
          LOG_LEVEL: "debug",
          RPC_URL_MAINNET: mainnetRpc,
          RPC_URL_GOERLI: goerliRpc,
          DYNAMODB_REGION: region,
          DYNAMODB_TABLE: lastWrapperEventBlock.tableName,
          INFURA_API_KEY: infuraApiKey,
          ALCHEMY_API_KEY: alchemyApiKey,
        },
      }
    );
    lastWrapperEventBlock.grantReadWriteData(wrappedEventListener);
    deferredMessageTopic.grantPublish(wrappedEventListener);
    const wrappedEventScheduleRule = new events.Rule(
      this,
      "wrappedEventScheduleRule",
      {
        schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      }
    );
    wrappedEventScheduleRule.addTarget(
      new eventTargets.LambdaFunction(wrappedEventListener)
    );

    // Domain
    const discordDomains =
      discordDomain instanceof Array ? discordDomain : [discordDomain];
    const discordDomainName = discordDomains.join(".");
    const discordHostedZone = route53.HostedZone.fromLookup(
      this,
      "HostedZone",
      {
        domainName:
          discordDomains.length === 2 ? discordDomains[1] : discordDomains[0],
      }
    );
    const discordCertificate = new acm.DnsValidatedCertificate(
      this,
      "certificate",
      {
        domainName: discordDomainName,
        hostedZone: discordHostedZone,
        region,
      }
    );

    const discordApi = new apigateway.RestApi(this, "discordApi", {
      restApiName: "Discord Service",
      description: "Discord callback",
      domainName: {
        domainName: discordDomainName,
        certificate: discordCertificate,
      },
    });

    const discordIntegration = new apigateway.LambdaIntegration(discordHandler);
    const discordResource = discordApi.root.addResource("discord");
    discordResource.addMethod("POST", discordIntegration);

    new route53.ARecord(this, "ipv4-record", {
      zone: discordHostedZone,
      recordName: discordDomainName,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGateway(discordApi)
      ),
    });
    new route53.AaaaRecord(this, "ipv6-record", {
      zone: discordHostedZone,
      recordName: discordDomainName,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGateway(discordApi)
      ),
    });

    new CfnOutput(this, "deferredMessageTopicArn", {
      description: "The topic ARN for sending messages into discord",
      value: deferredMessageTopic.topicArn,
    });
  }
}
