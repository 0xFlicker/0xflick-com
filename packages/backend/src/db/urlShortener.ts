import { IUrlShortener, UrlShortenerModel } from "@0xflick/models";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { createHmac } from "node:crypto";
import { createLogger } from "../utils/logger";

const logger = createLogger({
  name: "db/urlShortener",
});

type TPK = string & { __pk: void };
type TUrl = string & { __url: void };

export interface IDB {
  pk: TPK;
  url: TUrl;
  expires?: number;
}

function toPk(pk: string): TPK {
  return pk as TPK;
}
function toUrl(url: string): TUrl {
  return url as TUrl;
}

export class UrlShortenerDAO {
  public static TABLE_NAME =
    process.env.TABLE_NAME_URL_SHORTENER || "UrlShortener";
  public static HMAC_SECRET =
    process.env.HMAC_SECRET_URL_SHORTENER || "UrlShortenerDAO";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  public static fromModel(model: IUrlShortener, expires?: number): IDB {
    return {
      pk: toPk(model.hash),
      url: toUrl(model.url),
      ...(expires ? { expires } : {}),
    };
  }

  public static toModel(db: Record<string, any>): UrlShortenerModel {
    return UrlShortenerModel.fromJSON({
      hash: db.pk,
      url: db.url,
    });
  }

  public static hash(url: string): string {
    const hash = createHmac("sha256", UrlShortenerDAO.HMAC_SECRET)
      .update(url)
      .digest("hex");
    return hash;
  }

  public async create(
    url: string,
    expires?: number
  ): Promise<UrlShortenerModel> {
    const hash = UrlShortenerDAO.hash(url);
    const model: UrlShortenerModel = UrlShortenerModel.fromJSON({
      hash,
      url,
    });
    const item = UrlShortenerDAO.fromModel(model, expires);
    await this.db.send(
      new PutCommand({
        TableName: UrlShortenerDAO.TABLE_NAME,
        Item: item,
      })
    );
    return model;
  }

  public async get(shortUrl: string): Promise<UrlShortenerModel | null> {
    logger.debug(`get: ${shortUrl}`);
    const item = await this.db.send(
      new GetCommand({
        TableName: UrlShortenerDAO.TABLE_NAME,
        Key: {
          pk: toPk(shortUrl),
        },
      })
    );
    if (!item.Item) {
      logger.debug(`not found: ${shortUrl}`);
      return null;
    }

    const response = UrlShortenerDAO.toModel(item.Item);
    logger.debug(`found: ${shortUrl} => ${response.url}`);
    return response;
  }
}
