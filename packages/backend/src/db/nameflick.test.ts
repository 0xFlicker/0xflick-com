import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getDb } from "../db";
import { NameFlickDAO } from "./nameflick";

describe("#NameFlickDao", () => {
  const model = {
    normalized: "foo.test.eth",
    ensHash: "0x122",
    addresses: {
      ETH: "0x123",
      BTC: "0x124",
      LTC: "0x125",
      DOGE: "0x126",
    },
    content: "test",
    textRecord: {
      email: "test@example.com",
      avatar: "test#avatar",
      description: "test#description",
      com_discord: "test#com_discord",
      com_github: "test#com_github",
      url: "test#url",
      notice: "test#notice",
      keywords: "test#keywords",
      com_reddit: "test#com_reddit",
      com_twitter: "test#com_twitter",
      org_telegram: "test#org.telegram",
    },
    ttl: 500000,
  };
  it("can create a nameflick", async () => {
    const db = getDb();
    const dao = new NameFlickDAO(db);
    await dao.createOrUpdate(model);
    const modelFromDb = await dao.getByNormalizedName(model.normalized);
    expect(modelFromDb).toEqual(model);
    const rawDbModel = await db.send(
      new GetCommand({
        TableName: NameFlickDAO.TABLE_NAME,
        Key: {
          pk: model.normalized,
        },
      })
    );
    expect(rawDbModel.Item).toEqual({
      pk: "foo.test.eth",
      GSI1PK: "test.eth",
      GSI2PK: "0x122",
      ttl: 500000,
      content: "test",
      address_eth: "0x123",
      address_btc: "0x124",
      address_ltc: "0x125",
      address_doge: "0x126",
      text_email: "test@example.com",
      text_avatar: "test#avatar",
      text_description: "test#description",
      text_com_discord: "test#com_discord",
      text_com_github: "test#com_github",
      text_url: "test#url",
      text_notice: "test#notice",
      text_keywords: "test#keywords",
      text_com_reddit: "test#com_reddit",
      text_com_twitter: "test#com_twitter",
      text_org_telegram: "test#org.telegram",
    });
  });

  it("can get by enshash", async () => {
    const db = getDb();
    const dao = new NameFlickDAO(db);
    await dao.createOrUpdate(model);
    const modelFromDb = await dao.getByEnsHash(model.ensHash);
    expect(modelFromDb).toEqual(model);
  });

  it("can get by root domain", async () => {
    const anotherModel = {
      ...model,
      normalized: "bar.test.eth",
      addresses: {
        ETH: "0x12345",
      },
    };
    const db = getDb();
    const dao = new NameFlickDAO(db);
    await dao.createOrUpdate(model);
    await dao.createOrUpdate(anotherModel);
    const modelsFromDb = await dao.getByRootDomainName("test.eth");
    expect(modelsFromDb).toEqual([model, anotherModel]);
  });

  it("can update a nameflick", async () => {
    const db = getDb();
    const dao = new NameFlickDAO(db);
    const newModel = {
      ...model,
      addresses: {
        ...model.addresses,
        ETH: "0x127",
      },
      content: "test2",
      textRecord: {
        ...model.textRecord,
        email: "banana@example.com",
      },
    };
    await dao.createOrUpdate(newModel);
    const modelFromDb = await dao.getByNormalizedName(model.normalized);
    expect(modelFromDb).toEqual(newModel);
  });
});
