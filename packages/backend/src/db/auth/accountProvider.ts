import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { IAccountProvider, TProviderTypes } from "@0xflick/models";
import {
  accountProviderDBItemToModel,
  accountProviderToDBItem,
  accountToGSI1PK,
  accountToGSI1SK,
  accountToSortKey,
  tableName,
  userToPrimaryKey,
} from "./common";

export class AccountProviderDao {
  private readonly db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async createOrUpdate(accountProvider: IAccountProvider) {
    await this.db.send(
      new PutCommand({
        TableName: tableName(),
        Item: accountProviderToDBItem(accountProvider),
      })
    );
  }

  public async getByAddress(
    address: string
  ): Promise<IAccountProvider[] | null> {
    const result = await this.db.send(
      new ScanCommand({
        TableName: tableName(),
        FilterExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": userToPrimaryKey(address),
        },
      })
    );
    if (!result.Items) {
      return null;
    }
    return result.Items.map(accountProviderDBItemToModel);
  }

  public async getByAddressAndProvider(
    accountProvider: IAccountProvider
  ): Promise<IAccountProvider | null> {
    const result = await this.db.send(
      new GetCommand({
        TableName: tableName(),
        Key: {
          pk: userToPrimaryKey(accountProvider.address),
          sk: accountToSortKey(
            accountProvider.provider,
            accountProvider.providerAccountId
          ),
        },
      })
    );
    if (!result.Item) {
      return null;
    }
    return accountProviderDBItemToModel(result.Item);
  }

  public async getByProviderId(
    provider: TProviderTypes,
    providerAccountId: string
  ): Promise<IAccountProvider[] | null> {
    const result = await this.db.send(
      new ScanCommand({
        TableName: tableName(),
        IndexName: "GSI1",
        FilterExpression: "#gsi1pk = :gsi1pk AND #gsi1sk = :gsi1sk",
        ExpressionAttributeNames: {
          "#gsi1pk": "GSI1PK",
          "#gsi1sk": "GSI1SK",
        },
        ExpressionAttributeValues: {
          ":gsi1pk": accountToGSI1PK(provider),
          ":gsi1sk": accountToGSI1SK(providerAccountId),
        },
      })
    );
    if (!result.Items) {
      return null;
    }
    return result.Items.map(accountProviderDBItemToModel);
  }

  public async delete(accountProvider: Omit<IAccountProvider, "accessToken">) {
    await this.db.send(
      new DeleteCommand({
        TableName: tableName(),
        Key: {
          pk: userToPrimaryKey(accountProvider.address),
          sk: accountToSortKey(
            accountProvider.provider,
            accountProvider.providerAccountId
          ),
        },
      })
    );
  }
}
