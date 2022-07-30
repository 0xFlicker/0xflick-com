import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let instance: DynamoDBDocumentClient;

export function createDb(opts?: DynamoDBClientConfig) {
  const isTest = process.env.NODE_ENV === "test";
  const config = {
    ...(isTest
      ? {
          endpoint: "http://localhost:8000",
          region: "local-env",
        }
      : {
          endpoint: process.env.DYNAMODB_ENDPOINT,
          region: process.env.DYNAMODB_REGION || "us-east-1",
        }),
    ...opts,
  };
  const ddb = new DynamoDBClient(config);
  return DynamoDBDocumentClient.from(ddb, {
    marshallOptions: {
      convertEmptyValues: true,
    },
  });
}

export function getDb() {
  if (!instance) {
    instance = createDb();
  }
  return instance;
}
