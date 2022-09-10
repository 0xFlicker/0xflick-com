import type { IAffiliate } from "@0xflick/models";
import {
  BatchWriteCommand,
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
function addressToPk(address: string): TPK {
  return asPk(`ADDRESS#${address}`);
}
function slugToPk(slug: string): TPK {
  return asPk(`SLUG#${encodeURIComponent(slug)}`);
}
function asGsi1Pk(pk: string): GSI1PK {
  return pk as GSI1PK;
}
interface IAffiliateDB {
  pk: TPK;
  GSI1PK?: GSI1PK;
  roleId: string;
  slug?: string;
  address: string;
  deactivated?: boolean;
}
function affiliateSlugToDb(affiliate: IAffiliate): IAffiliateDB {
  return {
    pk: slugToPk(affiliate.slug),
    GSI1PK: asGsi1Pk(affiliate.address),
    slug: affiliate.slug,
    roleId: affiliate.roleId,
    address: affiliate.address,
    ...(affiliate.deactivated && { deactivated: affiliate.deactivated }),
  };
}
function enrollAffiliateToDb(affiliate: IAffiliate): IAffiliateDB {
  return {
    pk: addressToPk(affiliate.address),
    roleId: affiliate.roleId,
    address: affiliate.address,
  };
}
function dbToAffiliate(record: Record<string, any>): IAffiliate {
  const db = record as IAffiliateDB;
  return {
    address: db.address,
    roleId: db.roleId,
    slug: db.slug,
    ...(db.deactivated && { deactivated: db.deactivated }),
  };
}

const logger = createLogger({ name: "db/affiliate" });

export class AffiliateSlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Affiliate slug already exists: ${slug}`);
  }
}
export class AffiliateAddressAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Affiliate address already exists: ${slug}`);
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
 * +-------------------------+--------------+--------------+--------------------+--------------+
 * | pk                      | GSI1PK       | roleId       | slug               | address      |
 * +-------------------------+--------------+--------------+--------------------+--------------+
 * | ADDRESS#0xabcdef1234    |              | abcd-bf-wer  |                    | 0xabcdef1234 |
 * | SLUG#wow-much-cool      | 0xabcdef1234 | abcd-bf-wer  | wow-much-cool      | 0xabcdef1234 |
 * | SLUG#avg-rapid-process  | 0xabcdef1234 | abcd-bf-wer  | avg-rapid-process  | 0xabcdef1234 |
 * | ADDRESS#0xbadbeef03     |              | dao6-bf-f12  |                    | 0xbadbeef03  |
 * | SLUG#hot-ancient-needle | 0xbadbeef03  | dao6-bf-f12  | hot-ancient-needle | 0xbadbeef03  |
 * | ADDRESS#0xbadbeef04     |              | dao6-bf-f12  |                    | 0xbadbeef04  |
 * | SLUG#acrid-big-nail     | 0xbadbeef04  | dao6-bf-f12  | acrid-big-nail     | 0xbadbeef04  |
 * +-------------------------+--------------+--------------+--------------------+--------------+
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
          pk: slugToPk(slug),
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
    const db = affiliateSlugToDb(affiliate);
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

  public async enrollAffiliate(
    affiliate: Omit<IAffiliate, "slug">
  ): Promise<void> {
    try {
      await this.db.send(
        new PutCommand({
          TableName: AffiliateDAO.TABLE_NAME,
          Item: enrollAffiliateToDb(affiliate),
          ConditionExpression: "attribute_not_exists(pk)",
        })
      );
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "ConditionalCheckFailedException"
      ) {
        logger.warn("Duplicate entry on create", affiliate);
        throw new AffiliateAddressAlreadyExistsError(affiliate.address);
      }
      // Something else went wrong, rethrow
      throw err;
    }
  }

  public async getRootForAffiliateAddress(address: string) {
    const result = await this.db.send(
      new GetCommand({
        TableName: AffiliateDAO.TABLE_NAME,
        Key: {
          pk: addressToPk(address),
        },
      })
    );
    if (!result.Item) {
      return null;
    }
    return dbToAffiliate(result.Item);
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
          pk: slugToPk(slug),
        },
        UpdateExpression: "SET deactivated = :t",
        ExpressionAttributeValues: {
          ":t": true,
        },
      })
    );
  }

  public async deleteAffiliate(address: string): Promise<void> {
    // All entries
    const [root, children] = await Promise.all([
      this.getRootForAffiliateAddress(address),
      this.getAllForAddress(address),
    ]);
    if (!root && children.length === 0) {
      return;
    }
    await this.db.send(
      new BatchWriteCommand({
        RequestItems: {
          [AffiliateDAO.TABLE_NAME]: [
            ...(root && [
              {
                DeleteRequest: {
                  Key: {
                    pk: addressToPk(root.address),
                  },
                },
              },
            ]),
            ...children.map((child) => ({
              DeleteRequest: {
                Key: {
                  pk: slugToPk(child.slug),
                },
              },
            })),
          ],
        },
      })
    );
  }
}
