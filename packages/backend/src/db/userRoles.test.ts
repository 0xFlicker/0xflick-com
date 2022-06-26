import { getDb } from "./dynamodb";
import { v4 as createUuid } from "uuid";
import { UserRolesDAO } from "./userRoles";

describe("#UserRoles DAO", () => {
  it("should create a role binding", async () => {
    const address = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db);
    await dao.bind(address, roleId);
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([address]);
    const roles = await dao.getAllRoleIds(address);
    expect(roles).toBeDefined();
    expect(roles).toEqual([roleId]);
  });

  it("can unlink a role binding", async () => {
    const address = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db);
    await dao.bind(address, roleId);
    await dao.unlink(address, roleId);
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([]);
    const roles = await dao.getAllRoleIds(address);
    expect(roles).toBeDefined();
    expect(roles).toEqual([]);
  });

  it("can get all addresses for a role", async () => {
    const address1 = createUuid();
    const address2 = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db);
    await dao.bind(address1, roleId);
    await dao.bind(address2, roleId);
    // Wait for consistency
    await new Promise((resolve) => setTimeout(resolve, 100));
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([address1, address2]);
  });

  it("can get all roles for an address", async () => {
    const address = createUuid();
    const roleId1 = createUuid();
    const roleId2 = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db);
    await dao.bind(address, roleId1);
    await dao.bind(address, roleId2);
    // Wait for consistency
    await new Promise((resolve) => setTimeout(resolve, 100));
    const roles = await dao.getAllRoleIds(address);
    expect(roles).toBeDefined();
    expect(roles.length).toBe(2);
    expect(roles).toEqual([roleId1, roleId2]);
  });

  it("can batch unlink", async () => {
    const address1 = createUuid();
    const address2 = createUuid();
    const roleId = createUuid();
    const db = getDb();
    const dao = new UserRolesDAO(db);
    await dao.bind(address1, roleId);
    await dao.bind(address2, roleId);
    await dao.batchUnlinkByRoleId(roleId);
    const addresses = await dao.getAllAddresses(roleId);
    expect(addresses).toBeDefined();
    expect(addresses).toEqual([]);
  });
});
