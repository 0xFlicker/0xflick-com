import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { INameFlick } from "@0xflick/models";

export type TPK = string & { __pk: true };
export type GSI1PK = string & { __gsi1pk: true };
export type GSI2PK = string & { __gsi2pk: true };

function asPk(pk: string): TPK {
  return pk as TPK;
}

function asGsi1Pk(pk: string): GSI1PK {
  return pk as GSI1PK;
}

function asGsi2Pk(pk: string): GSI2PK {
  return pk as GSI2PK;
}

export interface IDB {
  pk: TPK;
  GSI1PK: GSI1PK;
  GSI2PK?: GSI2PK;
  ttl?: number;
  ["address!btc"]?: string;
  ["address!eth"]?: string;
  ["address!ltc"]?: string;
  ["address!doge"]?: string;
  content?: string;
  ["text!email"]?: string;
  ["text!avatar"]?: string;
  ["text!description"]?: string;
  ["text!com.discord"]?: string;
  ["text!com.github"]?: string;
  ["text!url"]?: string;
  ["text!notice"]?: string;
  ["text!keywords"]?: string;
  ["text!com.reddit"]?: string;
  ["text!com.twitter"]?: string;
  ["text!org.telegram"]?: string;
}

export function nameflickToDb(nameflick: INameFlick): IDB {
  const rootDomain = nameflick.normalized.split(".").slice(-2).join(".");
  return {
    pk: asPk(nameflick.normalized),
    GSI1PK: asGsi1Pk(rootDomain),
    ...(nameflick.ensHash ? { GSI2PK: asGsi2Pk(nameflick.ensHash) } : {}),
    ...(nameflick.ttl ? { ttl: nameflick.ttl } : {}),
    ...(nameflick.addresses?.BTC
      ? { ["address!btc"]: nameflick.addresses?.BTC }
      : {}),
    ...(nameflick.addresses?.ETH
      ? { ["address!eth"]: nameflick.addresses?.ETH }
      : {}),
    ...(nameflick.addresses?.LTC
      ? { ["address!ltc"]: nameflick.addresses?.LTC }
      : {}),
    ...(nameflick.addresses?.DOGE
      ? { ["address!doge"]: nameflick.addresses?.DOGE }
      : {}),
    ...(nameflick.content ? { content: nameflick.content } : {}),
    ...(nameflick.textRecord?.email
      ? { ["text!email"]: nameflick.textRecord?.email }
      : {}),
    ...(nameflick.textRecord?.avatar
      ? { ["text!avatar"]: nameflick.textRecord?.avatar }
      : {}),
    ...(nameflick.textRecord?.description
      ? { ["text!description"]: nameflick.textRecord?.description }
      : {}),
    ...(nameflick.textRecord?.["com.discord"]
      ? { ["text!com.discord"]: nameflick.textRecord?.["com.discord"] }
      : {}),
    ...(nameflick.textRecord?.["com.github"]
      ? { ["text!com.github"]: nameflick.textRecord?.["com.github"] }
      : {}),
    ...(nameflick.textRecord?.url
      ? { ["text!url"]: nameflick.textRecord?.url }
      : {}),
    ...(nameflick.textRecord?.notice
      ? { ["text!notice"]: nameflick.textRecord?.notice }
      : {}),
    ...(nameflick.textRecord?.keywords
      ? { ["text!keywords"]: nameflick.textRecord?.keywords }
      : {}),
    ...(nameflick.textRecord?.["com.reddit"]
      ? { ["text!com.reddit"]: nameflick.textRecord?.["com.reddit"] }
      : {}),
    ...(nameflick.textRecord?.["com.twitter"]
      ? { ["text!com.twitter"]: nameflick.textRecord?.["com.twitter"] }
      : {}),
    ...(nameflick.textRecord?.["org.telegram"]
      ? { ["text!org.telegram"]: nameflick.textRecord?.["org.telegram"] }
      : {}),
  };
}

function dbToNameflick(nameflick: Record<string, any>): INameFlick {
  return {
    normalized: nameflick.pk,
    ensHash: nameflick.GSI2PK,
    ttl: nameflick.ttl,
    addresses: {
      ...(nameflick["address!btc"] ? { BTC: nameflick["address!btc"] } : {}),
      ...(nameflick["address!eth"] ? { ETH: nameflick["address!eth"] } : {}),
      ...(nameflick["address!ltc"] ? { LTC: nameflick["address!ltc"] } : {}),
      ...(nameflick["address!doge"] ? { DOGE: nameflick["address!doge"] } : {}),
    },
    content: nameflick.content,
    textRecord: {
      ...(nameflick["text!email"] ? { email: nameflick["text!email"] } : {}),
      ...(nameflick["text!avatar"] ? { avatar: nameflick["text!avatar"] } : {}),
      ...(nameflick["text!description"]
        ? { description: nameflick["text!description"] }
        : {}),
      ...(nameflick["text!com.discord"]
        ? { "com.discord": nameflick["text!com.discord"] }
        : {}),
      ...(nameflick["text!com.github"]
        ? { "com.github": nameflick["text!com.github"] }
        : {}),
      ...(nameflick["text!url"] ? { url: nameflick["text!url"] } : {}),
      ...(nameflick["text!notice"] ? { notice: nameflick["text!notice"] } : {}),
      ...(nameflick["text!keywords"]
        ? { keywords: nameflick["text!keywords"] }
        : {}),
      ...(nameflick["text!com.reddit"]
        ? { "com.reddit": nameflick["text!com.reddit"] }
        : {}),
      ...(nameflick["text!com.twitter"]
        ? { "com.twitter": nameflick["text!com.twitter"] }
        : {}),
      ...(nameflick["text!org.telegram"]
        ? { "org.telegram": nameflick["text!org.telegram"] }
        : {}),
    },
  };
}

/**
 * @class NameFlickDao
 * NameFlickDao is a class that provides a set of methods for interacting with the NameFlick table.
 *
 *  pk: FQDN
 *  GSI1PK: root domain name
 *  GSI2PK: ens hash hex
 *  fields... (see INameFlick)
 *
 * @example
 *  pk                   | GSI1PK           | GSI2PK      | fields...
 * +---------------------+------------------+-------------+
 * | example.eth         | example.eth      | 0xbadbeef01 |
 * | *.example.eth       | example.eth      |             |
 * | foo.example.eth     | example.eth      | 0xbadbeef03 |
 * | foo.bar.example.eth | example.eth      | 0xbadbeef04 |
 * +---------------------+------------------+-------------+
 */
export class NameFlickDao {
  public static TABLE_NAME = process.env.TABLE_NAME_NAMEFLICK || "NameFlick";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async createOrUpdate(nameflick: INameFlick): Promise<void> {
    await this.db.send(
      new PutCommand({
        TableName: NameFlickDao.TABLE_NAME,
        Item: nameflickToDb(nameflick),
      })
    );
  }

  public async getByNormalizedName(pk: string): Promise<INameFlick | null> {
    const result = await this.db.send(
      new GetCommand({
        TableName: NameFlickDao.TABLE_NAME,
        Key: { pk },
      })
    );
    if (!result.Item) {
      return null;
    }
    return dbToNameflick(result.Item);
  }

  public async getByEnsHash(ensHash: string): Promise<INameFlick | null> {
    const result = await this.db.send(
      new QueryCommand({
        TableName: NameFlickDao.TABLE_NAME,
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :ensHash",
        ExpressionAttributeValues: {
          ":ensHash": ensHash,
        },
      })
    );
    if (!result.Items || result.Items.length === 0) {
      return null;
    }
    return dbToNameflick(result.Items[0]);
  }

  public async getByRootDomainName(rootDomain: string): Promise<INameFlick[]> {
    const result = await this.db.send(
      new QueryCommand({
        TableName: NameFlickDao.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :rootDomain",
        ExpressionAttributeValues: {
          ":rootDomain": rootDomain,
        },
      })
    );
    if (!result.Items || result.Items.length === 0) {
      return [];
    }
    return result.Items.map(dbToNameflick);
  }

  public async delete(pk: TPK): Promise<void> {
    await this.db.send(
      new DeleteCommand({
        TableName: NameFlickDao.TABLE_NAME,
        Key: { pk },
      })
    );
  }
}
