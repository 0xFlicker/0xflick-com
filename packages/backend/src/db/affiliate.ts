import type { IAffiliate } from "@0xflick/models";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { createLogger } from "../utils/logger";

type TPK = string & { __pk: true };
type GSI1PK = string & { __gsi1pk: true };
function asPk(pk: string): TPK {
  return pk as TPK;
}
function asGsi1Pk(pk: string): GSI1PK {
  return pk as GSI1PK;
}
interface IAffiliateDB {
  pk: TPK;
  GSI1PK: GSI1PK;
  roleId: string;
  address: string;
  deactivated?: boolean;
}
function affiliateToDb(affiliate: IAffiliate): IAffiliateDB {
  return {
    pk: asPk(affiliate.slug),
    GSI1PK: asGsi1Pk(affiliate.address),
    roleId: affiliate.roleId,
    address: affiliate.address,
    ...(affiliate.deactivated && { deactivated: affiliate.deactivated }),
  };
}
function dbToAffiliate(record: Record<string, any>): IAffiliate {
  const db = record as IAffiliateDB;
  return {
    address: db.address,
    roleId: db.roleId,
    slug: db.pk,
    ...(db.deactivated && { deactivated: db.deactivated }),
  };
}

const logger = createLogger({ name: "db/affiliate" });

class AffiliateSlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Affiliate slug already exists: ${slug}`);
  }
}
/**
 * @class AffiliateDAO
 * AffiliateDAO is for interacting with the Affiliates table.
 *
 *  pk: url slug
 *  address: owned address
 *  roleId: role id
 *  GSI1PK: address, used for querying all affiliates for an address
 *
 * @example
 *  pk                       | GSI1PK       | address      | roleId       |
 * +-------------------------+--------------+--------------+--------------+
 * | wow-much-cool           | 0xabcdef1234 | 0xabcdef1234 | abcd-bf-wer  |
 * | average-rapid-processor | 0xabcdef1234 | 0xabcdef1234 | abcd-bf-wer  |
 * | sharp-ancient-needle    | 0xbadbeef03  | 0xbadbeef03  | abcd-bf-wer  |
 * | acrid-colossal-nail     | 0xbadbeef04  | 0xbadbeef04  | abcd-bf-wer  |
 * +-------------------------+--------------+--------------+--------------+
 */
export class AffiliateDAO {
  public static TABLE_NAME = "Affiliates";
  private db: DynamoDBDocumentClient;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
  }

  /**
   * @method getAffiliate
   * @param {string} slug
   * @returns {Promise<IAffiliate>}
   * @description
   * Get an affiliate by slug.
   * @example
   * const affiliate = await affiliateDAO.getAffiliate("wow-much-cool");
   * console.log(affiliate);
   * // {
   * //   address: "0xabcdef1234",
   * //   slug: "wow-much-cool",
   * //   roleId: "abcd-bf-wer",
   * // }
   */
  public async getAffiliate(slug: string): Promise<IAffiliate | null> {
    const result = await this.db.send(
      new GetCommand({
        TableName: AffiliateDAO.TABLE_NAME,
        Key: {
          pk: slug,
        },
      })
    );
    if (!result.Item) {
      return null;
    }
    return dbToAffiliate(result.Item);
  }

  /**
   * @method createAffiliate
   * @param {IAffiliate} affiliate
   * @returns {Promise<IAffiliate>}
   * @throws {AffiliateSlugAlreadyExistsError}
   * @description
   * Create an affiliate.
   * Throws an error if the affiliate already exists.
   */
  public async createAffiliate(affiliate: IAffiliate): Promise<void> {
    const db = affiliateToDb(affiliate);
    try {
      await this.db.send(
        new PutCommand({
          TableName: AffiliateDAO.TABLE_NAME,
          Item: db,
          ConditionExpression: "attribute_not_exists(pk)",
        })
      );
    } catch (err) {
      // Check if this error is a known DynamoDB error
      if (
        err instanceof Error &&
        err.name === "ConditionalCheckFailedException"
      ) {
        logger.warn("Duplicate entry on create", affiliate);
        throw new AffiliateSlugAlreadyExistsError(affiliate.slug);
      }
      // Something else went wrong, rethrow
      throw err;
    }
  }

  public async getAllForAddress(address: string): Promise<IAffiliate[]> {
    const response = await this.db.send(
      new QueryCommand({
        TableName: AffiliateDAO.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        ExpressionAttributeValues: {
          ":pk": asGsi1Pk(address),
        },
      })
    );
    return response.Items.map(dbToAffiliate);
  }

  public async getActiveForAddress(address: string): Promise<IAffiliate[]> {
    const response = await this.db.send(
      new QueryCommand({
        TableName: AffiliateDAO.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        FilterExpression:
          "attribute_not_exists(deactivated) OR deactivated = :f",
        ExpressionAttributeValues: {
          ":pk": asGsi1Pk(address),
          ":f": false,
        },
      })
    );
    return response.Items.map(dbToAffiliate);
  }

  public async deactivateAffiliate(slug: string): Promise<void> {
    await this.db.send(
      new UpdateCommand({
        TableName: AffiliateDAO.TABLE_NAME,
        Key: {
          pk: slug,
        },
        UpdateExpression: "SET deactivated = :t",
        ExpressionAttributeValues: {
          ":t": true,
        },
      })
    );
  }
}
