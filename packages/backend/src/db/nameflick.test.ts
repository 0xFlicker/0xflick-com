import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getDb } from "../db";
import { NameFlickDao } from "./nameflick";

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
      "com.discord": "test#com.discord",
      "com.github": "test#com.github",
      url: "test#url",
      notice: "test#notice",
      keywords: "test#keywords",
      "com.reddit": "test#com.reddit",
      "com.twitter": "test#com.twitter",
      "org.telegram": "test#org.telegram",
    },
    ttl: 500000,
  };
  it("can create a nameflick", async () => {
    const db = getDb();
    const dao = new NameFlickDao(db);
    await dao.createOrUpdate(model);
    const modelFromDb = await dao.getByNormalizedName(model.normalized);
    expect(modelFromDb).toEqual(model);
    const rawDbModel = await db.send(
      new GetCommand({
        TableName: NameFlickDao.TABLE_NAME,
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
      "address!eth": "0x123",
      "address!btc": "0x124",
      "address!ltc": "0x125",
      "address!doge": "0x126",
      "text!email": "test@example.com",
      "text!avatar": "test#avatar",
      "text!description": "test#description",
      "text!com.discord": "test#com.discord",
      "text!com.github": "test#com.github",
      "text!url": "test#url",
      "text!notice": "test#notice",
      "text!keywords": "test#keywords",
      "text!com.reddit": "test#com.reddit",
      "text!com.twitter": "test#com.twitter",
      "text!org.telegram": "test#org.telegram",
    });
  });

  it("can get by enshash", async () => {
    const db = getDb();
    const dao = new NameFlickDao(db);
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
    const dao = new NameFlickDao(db);
    await dao.createOrUpdate(model);
    await dao.createOrUpdate(anotherModel);
    const modelsFromDb = await dao.getByRootDomainName("test.eth");
    expect(modelsFromDb).toEqual([model, anotherModel]);
  });

  it("can update a nameflick", async () => {
    const db = getDb();
    const dao = new NameFlickDao(db);
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
