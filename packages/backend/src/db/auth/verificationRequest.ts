import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import type { IVerificationRequest } from "@0xflick/models";
import {
  stateDBItemToModel,
  stateToDBItem,
  stateToPrimaryKey,
  stateToSortKey,
  tableName,
} from "./common";

export class VerificationRequestDao {
  private readonly db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async create(verifier: IVerificationRequest) {
    await this.db.send(
      new PutCommand({
        TableName: tableName(),
        Item: stateToDBItem(verifier),
      })
    );
  }

  public async get(state: string): Promise<IVerificationRequest | null> {
    const result = await this.db.send(
      new GetCommand({
        TableName: tableName(),
        Key: {
          pk: stateToPrimaryKey(state),
          sk: stateToSortKey(state),
        },
      })
    );
    if (!result.Item) {
      return null;
    }
    return stateDBItemToModel(result.Item);
  }

  public async delete(state: string) {
    await this.db.send(
      new DeleteCommand({
        TableName: tableName(),
        Key: {
          pk: stateToPrimaryKey(state),
          sk: stateToSortKey(state),
        },
      })
    );
  }
}
