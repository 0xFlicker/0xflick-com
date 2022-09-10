import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { getDb } from "../db";

import { AffiliateDAO } from "./affiliate";

describe("AffiliateDAO", () => {
  const db = getDb();
  const dao = new AffiliateDAO(db);

  describe("getAffiliate", () => {
    it("can create an affiliate", async () => {
      const affiliate = {
        address: "0x123",
        roleId: "0x456",
        slug: "test",
      };
      await dao.createAffiliate(affiliate);
      const affiliateFromDb = await dao.getAffiliate(affiliate.slug);
      expect(affiliateFromDb).toEqual(affiliate);
      const rawDbModel = await db.send(
        new GetCommand({
          TableName: AffiliateDAO.TABLE_NAME,
          Key: {
            pk: `SLUG#${affiliate.slug}`,
          },
        })
      );
      expect(rawDbModel.Item).toEqual({
        pk: "SLUG#test",
        GSI1PK: "0x123",
        address: "0x123",
        roleId: "0x456",
        slug: "test",
      });
    });
    it("can get all affiliates for an address", async () => {
      const affiliate1 = {
        address: "0x123",
        roleId: "0x456",
        slug: "test1",
      };
      const affiliate2 = {
        address: "0x123",
        roleId: "0x456",
        slug: "test2",
      };
      await dao.createAffiliate(affiliate1);
      await dao.createAffiliate(affiliate2);
      const affiliates = await dao.getAllForAddress(affiliate1.address);
      expect(affiliates).toEqual(
        expect.arrayContaining([affiliate1, affiliate2])
      );
    });
    it("can get all filter deactivated affiliates for an address", async () => {
      const affiliate1 = {
        address: "0x123",
        roleId: "0x456",
        slug: "test3",
      };
      const affiliate2 = {
        address: "0x123",
        roleId: "0x456",
        slug: "test4",
        deactivated: true,
      };
      await dao.createAffiliate(affiliate1);
      await dao.createAffiliate(affiliate2);
      const affiliates = await dao.getActiveForAddress(affiliate1.address);
      expect(affiliates).toEqual([affiliate1]);
    });
  });
  it("can deactivate an affiliate slug", async () => {
    const affiliate = {
      address: "0x123",
      roleId: "0x456",
      slug: "test5",
    };
    await dao.createAffiliate(affiliate);
    await dao.deactivateAffiliate(affiliate.slug);
    const affiliateFromDb = await dao.getAffiliate(affiliate.slug);
    expect(affiliateFromDb).toEqual({ ...affiliate, deactivated: true });
  });

  it("can enroll a new address", async () => {
    const roleId = uuid();
    const address = uuid();
    await dao.enrollAffiliate({
      address,
      roleId,
    });
    const roleFromDb = await dao.getRootForAffiliateAddress(address);
    expect(roleFromDb.roleId).toEqual(roleId);
  });
});
