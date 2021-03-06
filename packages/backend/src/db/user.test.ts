import { getDb } from "./dynamodb";
import { v4 as createUuid } from "uuid";
import { UserDAO } from "./user";

describe("#User MODEL", () => {
  it("should return null if user does not exist", async () => {
    const userId = createUuid();
    const db = getDb();
    const dao = new UserDAO(db);
    const user = await dao.getUser(userId);
    expect(user).toBeNull();
  });
});
