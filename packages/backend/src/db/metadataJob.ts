import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  IMetadataJob,
  EMetadataJobStatus,
  isValidMetadataJobStatus,
} from "@0xflick/models";
import { utils } from "ethers";

/*
+------------------+-----------+--------------------------------------------------------------+
| Attribute Name   | Data Type | Description                                                  |
+------------------+-----------+--------------------------------------------------------------+
| job_id           | String    | Unique identifier for the metadata fetch job.                |
+------------------+-----------+--------------------------------------------------------------+
| address          | String    | The address of the user who initiated the metadata fetch job.|
+------------------+-----------+--------------------------------------------------------------+
| status           | String    | The current status of the job (pending, in progress,         |
|                  |           | complete, failed, stopped).                                  |
+------------------+-----------+--------------------------------------------------------------+
| progress         | Number    | The progress of the job, represented as a percentage (0-100).|
+------------------+-----------+--------------------------------------------------------------+
| contract_address | String    | The contract address associated with the metadata fetch job. |
+------------------+-----------+--------------------------------------------------------------+
| chain_id         | Number    | The chain ID of the Ethereum network (mainnet or testnet)    |
|                  |           | associated with the metadata fetch job.                      |
+------------------+-----------+--------------------------------------------------------------+
| created_at       | Number    | Timestamp (in epoch milliseconds) when the job was created.  |
+------------------+-----------+--------------------------------------------------------------+
| updated_at       | Number    | Timestamp (in epoch milliseconds) when the job was last      |
|                  |           | updated.                                                     |
+------------------+-----------+--------------------------------------------------------------+

Primary Key:

Partition Key: jobId
The primary key uniquely identifies each item in the table, and it consists of a single attribute – the jobId.

Global Secondary Indexes:

GS1: Sorts jobs by address
Partition Key: address
Sort Key: jobId


With this table schema, you can easily query the job status and progress using the jobId. Additionally, you can 
update the status and progress attributes as the job progresses or its state changes.

For example, when a metadata fetch job is created, you can add an item to the table with the jobId, initial status 
(e.g., "pending" or "in progress"), progress (e.g., 0), contractAddress, and createdAt timestamp. As the job progresses, 
you can update the status, progress, and updatedAt attributes accordingly.


*/

export interface IMetadataJobDB {
  job_id: string;
  status: EMetadataJobStatus;
  total: number;
  for_address: `0x{string}`;
  contract_address: `0x{string}`;
  chain_id: number;
  total_success: number;
  total_failed: number;
  created_at: number;
  updated_at: number;
  expires: number;
}

export function metadataJobToDb(metadataJob: IMetadataJob): IMetadataJobDB {
  return {
    job_id: metadataJob.jobId,
    status: metadataJob.status,
    total: metadataJob.total,
    for_address: metadataJob.forAddress,
    contract_address: metadataJob.contractAddress,
    chain_id: metadataJob.chainId,
    total_success: metadataJob.totalSuccess,
    total_failed: metadataJob.totalFailed,
    created_at: Math.floor(metadataJob.createdAt.getTime() / 1000),
    updated_at: Math.floor(metadataJob.updatedAt.getTime() / 1000),
    expires: Math.floor(metadataJob.updatedAt.getTime() / 1000) + 86400,
  };
}

export function metadataJobFromDb(metadataJob: IMetadataJobDB): IMetadataJob {
  if (!utils.isAddress(metadataJob.contract_address)) {
    throw new Error(
      `Invalid contract address: ${metadataJob.contract_address} for job ${metadataJob.job_id}`
    );
  }
  if (!isValidMetadataJobStatus(metadataJob.status)) {
    throw new Error(
      `Invalid metadata job status: ${metadataJob.status} for job ${metadataJob.job_id}`
    );
  }

  return {
    jobId: metadataJob.job_id,
    status: metadataJob.status,
    total: metadataJob.total,
    forAddress: metadataJob.for_address,
    contractAddress: metadataJob.contract_address,
    chainId: metadataJob.chain_id,
    totalSuccess: metadataJob.total_success,
    totalFailed: metadataJob.total_failed,
    createdAt: new Date(metadataJob.created_at * 1000),
    updatedAt: new Date(metadataJob.updated_at * 1000),
  };
}

export class MetadataJobDAO {
  public static TABLE_NAME =
    process.env.TABLE_NAME_METADATA_JOB || "MetadataJob";
  private readonly db: DynamoDBDocumentClient;

  constructor(client: DynamoDBDocumentClient) {
    this.db = client;
  }

  async get(jobId: string): Promise<IMetadataJob | undefined> {
    const result = await this.db.send(
      new GetCommand({
        TableName: MetadataJobDAO.TABLE_NAME,
        Key: {
          jobId,
        },
      })
    );

    if (!result.Item) {
      return undefined;
    }

    return metadataJobFromDb(result.Item as IMetadataJobDB);
  }

  async create(
    metadataJob: Omit<IMetadataJob, "createdAt" | "updatedAt">
  ): Promise<IMetadataJob> {
    const now = new Date();
    const metadataJobWithTimestamps = {
      ...metadataJob,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.send(
      new PutCommand({
        TableName: MetadataJobDAO.TABLE_NAME,
        Item: metadataJobToDb(metadataJobWithTimestamps),
      })
    );

    return metadataJobWithTimestamps;
  }

  async writeChunkProgress({
    jobId,
    countSuccess,
    countFailed,
  }: {
    jobId: string;
    countSuccess: number;
    countFailed: number;
  }): Promise<IMetadataJob> {
    const now = new Date();
    const response = await this.db.send(
      new UpdateCommand({
        TableName: MetadataJobDAO.TABLE_NAME,
        Key: {
          jobId,
        },
        UpdateExpression:
          "set #totalSuccess = #totalSuccess + :incrTotalSuccess, #totalFailed = #totalFailed + :incrTotalFailed, #updatedAt = :updatedAt, #expires = :expires",
        ExpressionAttributeNames: {
          "#totalSuccess": "total_success",
          "#totalFailed": "total_failed",
          "#updatedAt": "updated_at",
          "#expires": "expires"
        },
        ExpressionAttributeValues: {
          ":incrTotalSuccess": countSuccess,
          ":incrTotalFailed": countFailed,
          ":updatedAt": Math.floor(now.getTime() / 1000),
          ":expires": Math.floor(now.getTime() / 1000) + 86400,
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return metadataJobFromDb(response.Attributes as IMetadataJobDB);
  }

  async updateStatus(
    jobId: string,
    status: EMetadataJobStatus
  ): Promise<IMetadataJob> {
    const response = await this.db.send(
      new UpdateCommand({
        TableName: MetadataJobDAO.TABLE_NAME,
        Key: {
          jobId,
        },
        UpdateExpression: "set #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updated_at",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": Math.floor(new Date().getTime() / 1000),
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return metadataJobFromDb(response.Attributes as IMetadataJobDB);
  }

  async delete(jobId: string): Promise<void> {
    const result = await this.db.send(
      new DeleteCommand({
        TableName: MetadataJobDAO.TABLE_NAME,
        Key: {
          jobId,
        },
      })
    );
  }

  async listByAddress(address: string): Promise<IMetadataJob[]> {
    const result = await this.db.send(
      new QueryCommand({
        TableName: MetadataJobDAO.TABLE_NAME,
        IndexName: "GS1",
        KeyConditionExpression: "#address = :address",
        ExpressionAttributeNames: {
          "#address": "address",
        },
        ExpressionAttributeValues: {
          ":address": address,
        },
      })
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) =>
      metadataJobFromDb(item as IMetadataJobDB)
    );
  }
}
