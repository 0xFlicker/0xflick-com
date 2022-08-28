import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { INameflick, rootFromEnsName } from "@0xflick/models";

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

export interface INameFlickDB {
  pk: TPK;
  GSI1PK: GSI1PK;
  GSI2PK?: GSI2PK;
  ttl?: number;
  erc721?: string;
  ["address_btc"]?: string;
  ["address_eth"]?: string;
  ["address_ltc"]?: string;
  ["address_doge"]?: string;
  content?: string;
  ["text_email"]?: string;
  ["text_avatar"]?: string;
  ["text_description"]?: string;
  ["text_com_discord"]?: string;
  ["text_com_github"]?: string;
  ["text_url"]?: string;
  ["text_notice"]?: string;
  ["text_keywords"]?: string;
  ["text_com_reddit"]?: string;
  ["text_com_twitter"]?: string;
  ["text_org_telegram"]?: string;
}

export function nameflickToDb(nameflick: INameflick): INameFlickDB {
  const rootDomain = rootFromEnsName(nameflick.normalized);
  return {
    pk: asPk(nameflick.normalized),
    GSI1PK: asGsi1Pk(rootDomain),
    ...(nameflick.ensHash ? { GSI2PK: asGsi2Pk(nameflick.ensHash) } : {}),
    ...(nameflick.ttl ? { ttl: nameflick.ttl } : {}),
    ...(nameflick.addresses?.BTC
      ? { ["address_btc"]: nameflick.addresses?.BTC }
      : {}),
    ...(nameflick.addresses?.ETH
      ? { ["address_eth"]: nameflick.addresses?.ETH }
      : {}),
    ...(nameflick.addresses?.LTC
      ? { ["address_ltc"]: nameflick.addresses?.LTC }
      : {}),
    ...(nameflick.addresses?.DOGE
      ? { ["address_doge"]: nameflick.addresses?.DOGE }
      : {}),
    ...(nameflick.erc721 ? { erc721: nameflick.erc721 } : {}),
    ...(nameflick.content ? { content: nameflick.content } : {}),
    ...(nameflick.textRecord?.email
      ? { ["text_email"]: nameflick.textRecord?.email }
      : {}),
    ...(nameflick.textRecord?.avatar
      ? { ["text_avatar"]: nameflick.textRecord?.avatar }
      : {}),
    ...(nameflick.textRecord?.description
      ? { ["text_description"]: nameflick.textRecord?.description }
      : {}),
    ...(nameflick.textRecord?.["com_discord"]
      ? { ["text_com_discord"]: nameflick.textRecord?.["com_discord"] }
      : {}),
    ...(nameflick.textRecord?.["com_github"]
      ? { ["text_com_github"]: nameflick.textRecord?.["com_github"] }
      : {}),
    ...(nameflick.textRecord?.url
      ? { ["text_url"]: nameflick.textRecord?.url }
      : {}),
    ...(nameflick.textRecord?.notice
      ? { ["text_notice"]: nameflick.textRecord?.notice }
      : {}),
    ...(nameflick.textRecord?.keywords
      ? { ["text_keywords"]: nameflick.textRecord?.keywords }
      : {}),
    ...(nameflick.textRecord?.["com_reddit"]
      ? { ["text_com_reddit"]: nameflick.textRecord?.["com_reddit"] }
      : {}),
    ...(nameflick.textRecord?.["com_twitter"]
      ? { ["text_com_twitter"]: nameflick.textRecord?.["com_twitter"] }
      : {}),
    ...(nameflick.textRecord?.["org_telegram"]
      ? { ["text_org_telegram"]: nameflick.textRecord?.["org_telegram"] }
      : {}),
  };
}

function dbToNameflick(nameflick: Record<string, any>): INameflick {
  return {
    normalized: nameflick.pk,
    ensHash: nameflick.GSI2PK,
    ttl: nameflick.ttl,
    addresses: {
      ...(nameflick["address_btc"] ? { BTC: nameflick["address_btc"] } : {}),
      ...(nameflick["address_eth"] ? { ETH: nameflick["address_eth"] } : {}),
      ...(nameflick["address_ltc"] ? { LTC: nameflick["address_ltc"] } : {}),
      ...(nameflick["address_doge"] ? { DOGE: nameflick["address_doge"] } : {}),
    },
    content: nameflick.content,
    erc721: nameflick.erc721,
    textRecord: {
      ...(nameflick["text_email"] ? { email: nameflick["text_email"] } : {}),
      ...(nameflick["text_avatar"] ? { avatar: nameflick["text_avatar"] } : {}),
      ...(nameflick["text_description"]
        ? { description: nameflick["text_description"] }
        : {}),
      ...(nameflick["text_com_discord"]
        ? { com_discord: nameflick["text_com_discord"] }
        : {}),
      ...(nameflick["text_com_github"]
        ? { com_github: nameflick["text_com_github"] }
        : {}),
      ...(nameflick["text_url"] ? { url: nameflick["text_url"] } : {}),
      ...(nameflick["text_notice"] ? { notice: nameflick["text_notice"] } : {}),
      ...(nameflick["text_keywords"]
        ? { keywords: nameflick["text_keywords"] }
        : {}),
      ...(nameflick["text_com_reddit"]
        ? { com_reddit: nameflick["text_com_reddit"] }
        : {}),
      ...(nameflick["text_com_twitter"]
        ? { com_twitter: nameflick["text_com_twitter"] }
        : {}),
      ...(nameflick["text_org_telegram"]
        ? { org_telegram: nameflick["text_org_telegram"] }
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
 *  pk                   | GSI1PK           | GSI2PK      | GSI2PK   fields...
 * +---------------------+------------------+-------------+---------
 * | example.eth         | example.eth      | 0xbadbeef01 | 0xabcd...
 * | *.example.eth       | example.eth      |             | 0xabce...
 * | foo.example.eth     | example.eth      | 0xbadbeef03 | 0xabcf...
 * | foo.bar.example.eth | example.eth      | 0xbadbeef04 | 0xabcg...
 * +---------------------+------------------+-------------+---------
 */
export class NameFlickDAO {
  public static TABLE_NAME = process.env.TABLE_NAME_NAMEFLICK || "NameFlick";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public async createOrUpdate(nameflick: INameflick): Promise<void> {
    const dbObj = nameflickToDb(nameflick);
    await this.db.send(
      new UpdateCommand({
        TableName: NameFlickDAO.TABLE_NAME,
        Key: { pk: nameflick.normalized },
        UpdateExpression: `set ${Object.keys(dbObj)
          .filter((k) => k !== "pk")
          .map((k) => `#${k} = :${k}`)
          .join(", ")}`,
        ExpressionAttributeValues: Object.fromEntries(
          Object.entries(dbObj)
            .filter(([k]) => k !== "pk")
            .map(([k, v]) => [`:${k}`, v])
        ),
        ExpressionAttributeNames: Object.fromEntries(
          Object.keys(dbObj)
            .filter((k) => k !== "pk")
            .map((k) => [`#${k}`, k])
        ),
      })
    );
  }

  public async getByNormalizedName(pk: string): Promise<INameflick | null> {
    const result = await this.db.send(
      new GetCommand({
        TableName: NameFlickDAO.TABLE_NAME,
        Key: { pk },
      })
    );
    if (!result.Item) {
      return null;
    }
    return dbToNameflick(result.Item);
  }

  public async getByEnsHash(ensHash: string): Promise<INameflick | null> {
    const result = await this.db.send(
      new QueryCommand({
        TableName: NameFlickDAO.TABLE_NAME,
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

  public async getByRootDomainName(rootDomain: string): Promise<INameflick[]> {
    const result = await this.db.send(
      new QueryCommand({
        TableName: NameFlickDAO.TABLE_NAME,
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

  public async reverseLookup(address: string): Promise<INameflick[]> {
    const result = await this.db.send(
      new QueryCommand({
        TableName: NameFlickDAO.TABLE_NAME,
        IndexName: "GSI3",
        KeyConditionExpression: "#eth = :address",
        ExpressionAttributeValues: {
          ":address": address,
        },
        ExpressionAttributeNames: {
          "#eth": `address!eth`,
        },
      })
    );
    if (!result.Items || result.Items.length === 0) {
      return [];
    }
    return result.Items.map(dbToNameflick);
  }

  public async deleteByFqdn(pk: string): Promise<void> {
    await this.db.send(
      new DeleteCommand({
        TableName: NameFlickDAO.TABLE_NAME,
        Key: { pk },
      })
    );
  }
}
