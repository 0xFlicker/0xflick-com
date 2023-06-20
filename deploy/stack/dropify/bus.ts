import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as events from "aws-cdk-lib/aws-events";
import * as events_targets from "aws-cdk-lib/aws-events-targets";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { buildSync } from "esbuild";

interface NftMetadataBusProps {}

export class NftMetadataBus extends Construct {
  readonly nftMetadataEventBus: events.EventBus;
  readonly metadataFetchStartQueue: sqs.Queue;
  readonly metadataFetchStopQueue: sqs.Queue;
  readonly metadataFetchChunkQueue: sqs.Queue;
  readonly metadataFetchCompleteQueue: sqs.Queue;
  readonly metadataFetchDeadLetterQueue: sqs.Queue;

  readonly metadataQueryQueue: sqs.Queue;

  constructor(scope: Construct, id: string, _?: NftMetadataBusProps) {
    super(scope, id);

    // Create the custom EventBridge event bus
    const nftMetadataEventBus = new events.EventBus(
      this,
      "NftMetadataEventBus"
    );

    // Create the SQS queues for metadata fetch and metadata query operations
    const metadataFetchStartQueue = new sqs.Queue(
      this,
      "MetadataFetchStartQueue"
    );
    const metadataFetchStopQueue = new sqs.Queue(
      this,
      "MetadataFetchStopQueue"
    );
    const metadataFetchChunkQueue = new sqs.Queue(
      this,
      "MetadataFetchChunkQueue"
    );
    const metadataFetchCompleteQueue = new sqs.Queue(
      this,
      "MetadataFetchCompleteQueue"
    );
    const metadataFetchDeadLetterQueue = new sqs.Queue(
      this,
      "MetadataFetchDeadLetterQueue",
      {
        retentionPeriod: cdk.Duration.days(14),
      }
    );

    const metadataQueryQueue = new sqs.Queue(this, "MetadataQueryQueue", {
      queueName: "MetadataQueryQueue",
    });

    // Create the EventBridge rule for metadata fetch events
    const metadataFetchStartRule = new events.Rule(
      this,
      "MetadataFetchStartRule",
      {
        eventBus: nftMetadataEventBus,
        eventPattern: {
          detailType: ["metadata_fetch_start"],
        },
      }
    );
    metadataFetchStartRule.addTarget(
      new events_targets.SqsQueue(metadataFetchStartQueue, {
        message: events.RuleTargetInput.fromObject({
          type: events.EventField.fromPath("$.detail-type"),
          data: events.EventField.fromPath("$.detail"),
        }),
      })
    );
    const fetchStartLambda = new lambda.Function(
      this,
      "MetadataFetchStartLambda",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("../../apps/functions", {
          bundling: {
            local: {
              tryBundle(outputDir: string) {
                const result = buildSync({
                  entryPoints: ["./src/dropify/event/fetchStart.ts"],
                  outfile: `${outputDir}/index.js`,
                  bundle: true,
                  platform: "node",
                  target: "node16",
                  external: ["aws-sdk"],
                });
                return !!result;
              },
            },
            image: lambda.Runtime.NODEJS_16_X.bundlingImage,
          },
        }),
        timeout: cdk.Duration.seconds(5),
      }
    );

    this.metadataFetchStartQueue = metadataFetchStartQueue;

    const metadataFetchStopRule = new events.Rule(
      this,
      "MetadataFetchStopRule",
      {
        eventBus: nftMetadataEventBus,
        eventPattern: {
          detailType: ["metadata_fetch_stop"],
        },
      }
    );
    metadataFetchStopRule.addTarget(
      new events_targets.SqsQueue(metadataFetchStopQueue, {
        message: events.RuleTargetInput.fromObject({
          type: events.EventField.fromPath("$.detail-type"),
          data: events.EventField.fromPath("$.detail"),
        }),
      })
    );
    this.metadataFetchStopQueue = metadataFetchStopQueue;

    const metadataFetchChunkRule = new events.Rule(
      this,
      "MetadataFetchChunkRule",
      {
        eventBus: nftMetadataEventBus,
        eventPattern: {
          detailType: ["metadata_fetch_process_chunk"],
        },
      }
    );
    metadataFetchChunkRule.addTarget(
      new events_targets.SqsQueue(metadataFetchChunkQueue, {
        message: events.RuleTargetInput.fromObject({
          type: events.EventField.fromPath("$.detail-type"),
          data: events.EventField.fromPath("$.detail"),
        }),
      })
    );
    this.metadataFetchChunkQueue = metadataFetchChunkQueue;

    const metadataFetchCompleteRule = new events.Rule(
      this,
      "MetadataFetchCompleteRule",
      {
        eventBus: nftMetadataEventBus,
        eventPattern: {
          detailType: ["metadata_fetch_complete"],
        },
      }
    );
    metadataFetchCompleteRule.addTarget(
      new events_targets.SqsQueue(metadataFetchCompleteQueue, {
        message: events.RuleTargetInput.fromObject({
          type: events.EventField.fromPath("$.detail-type"),
          data: events.EventField.fromPath("$.detail"),
        }),
      })
    );
    this.metadataFetchCompleteQueue = metadataFetchCompleteQueue;

    const metadataFetchFailedRule = new events.Rule(
      this,
      "MetadataFetchFailedRule",
      {
        eventBus: nftMetadataEventBus,
        eventPattern: {
          detailType: ["metadata_fetch_failed"],
        },
      }
    );
    metadataFetchFailedRule.addTarget(
      new events_targets.SqsQueue(metadataFetchDeadLetterQueue, {
        message: events.RuleTargetInput.fromObject({
          type: events.EventField.fromPath("$.detail-type"),
          data: events.EventField.fromPath("$.detail"),
        }),
      })
    );
    this.metadataFetchDeadLetterQueue = metadataFetchDeadLetterQueue;

    // Create the EventBridge rule for metadata query events
    const metadataQueryRule = new events.Rule(this, "MetadataQueryRule", {
      eventBus: nftMetadataEventBus,
      eventPattern: {
        detailType: ["metadata_query"],
      },
    });

    metadataQueryRule.addTarget(
      new events_targets.SqsQueue(metadataQueryQueue, {
        message: events.RuleTargetInput.fromObject({
          type: events.EventField.fromPath("$.detail-type"),
          data: events.EventField.fromPath("$.detail"),
        }),
      })
    );

    this.nftMetadataEventBus = nftMetadataEventBus;
    this.metadataQueryQueue = metadataQueryQueue;

    new cdk.CfnOutput(this, "NftMetadataEventBusName", {
      value: nftMetadataEventBus.eventBusName,
    });
    new cdk.CfnOutput(this, "MetadataFetchStartQueueUrl", {
      value: metadataFetchStartQueue.queueUrl,
    });
    new cdk.CfnOutput(this, "MetadataFetchStopQueueUrl", {
      value: metadataFetchStopQueue.queueUrl,
    });
    new cdk.CfnOutput(this, "MetadataFetchChunkQueueUrl", {
      value: metadataFetchChunkQueue.queueUrl,
    });
    new cdk.CfnOutput(this, "MetadataFetchCompleteQueueUrl", {
      value: metadataFetchCompleteQueue.queueUrl,
    });
    new cdk.CfnOutput(this, "MetadataFetchDeadLetterQueueUrl", {
      value: metadataFetchDeadLetterQueue.queueUrl,
    });
    new cdk.CfnOutput(this, "MetadataQueryQueueUrl", {
      value: metadataQueryQueue.queueUrl,
    });
  }
}
