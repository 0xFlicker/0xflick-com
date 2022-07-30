import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import type { IAccountUser } from "@0xflick/models";
import {
  tableName,
  userDBItemToModel,
  userToDBItem,
  userToPrimaryKey,
  userToSortKey,
} from "./common";

export class AccountUserDao {
  private readonly db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async create(accountUser: IAccountUser) {
    await this.db.send(
      new PutCommand({
        TableName: tableName(),
        Item: userToDBItem(accountUser),
      })
    );
  }

  public async get(address: string): Promise<IAccountUser | null> {
    const result = await this.db.send(
      new GetCommand({
        TableName: tableName(),
        Key: {
          pk: userToPrimaryKey(address),
          sk: userToSortKey(address),
        },
      })
    );
    if (!result.Item) {
      return null;
    }
    return userDBItemToModel(result.Item);
  }

  public async delete(address: string) {
    await this.db.send(
      new DeleteCommand({
        TableName: tableName(),
        Key: {
          pk: userToPrimaryKey(address),
          sk: userToSortKey(address),
        },
      })
    );
  }
}
