import { promisePublicKey, verifyJwtToken } from "@0xflick/models/user";
import { getDb } from "./dynamodb";
import { v4 as createUuid } from "uuid";
import { UserDAO } from "./user";
import { createJwtToken, promisePrivateKey } from "./token";
import { TokenModel } from "@0xflick/models/token";
import * as jose from "jose";
import { EActions, EResource } from "@0xflick/models/permissions";
import { RolePermissionsDAO } from "./rolePermissions";
import { RolesDAO } from "./roles";
import { UserRolesDAO } from "./userRoles";

describe("#Token DAO", () => {
  it("can exchange JWE", async () => {
    const ge = new jose.CompactEncrypt(
      new TextEncoder().encode(
        "It's dangerous to go alone! Take this. Do do do dooooooo"
      )
    );
    const pubKey = await promisePublicKey;
    const privKey = await promisePrivateKey;

    const jwe = await ge
      .setProtectedHeader({
        kid: "kid",
        alg: "ECDH-ES+A128KW",
        enc: "A128GCM",
        crv: "P-521",
      })
      .encrypt(pubKey);
    expect(jwe).toBeTruthy();

    const jweDec = await jose.compactDecrypt(jwe, privKey);

    // Now create a JWT using the wrapped secret
    const jws = await new jose.SignJWT({
      foo: "bar",
    })
      .setProtectedHeader({
        alg: "ES512",
      })
      .setAudience("0x1234567890123456789012345678901234567890")
      .setIssuedAt()
      .setIssuer(TokenModel.JWT_CLAIM_ISSUER)
      .setSubject("sub")
      .setExpirationTime("12h")
      .sign(privKey);

    // Now verify the JWT
    const jwt = await jose.jwtVerify(jws, pubKey);
  });

  it("can create a JWT token", async () => {
    TokenModel.JWT_CLAIM_ISSUER = "https://example.com";
    const userId = createUuid();
    const db = getDb();
    const dao = new UserDAO(db);
    const permissionDao = new RolePermissionsDAO(db);
    const rolesDao = new RolesDAO(db);

    const roleId = createUuid();
    await rolesDao.create({
      id: roleId,
      name: "test",
    });
    await permissionDao.bind({
      roleId,
      action: EActions.DELETE,
      resource: EResource.PRESALE,
    });

    await dao.create({
      address: userId,
    });
    const userRolesDao = new UserRolesDAO(db);
    await userRolesDao.bind({
      address: userId,
      roleId: roleId,
      rolesDao,
    });

    const token = await createJwtToken({
      address: userId,
      roleIds: [roleId],
      nonce: 0,
    });
    expect(token).toBeDefined();
    expect(await verifyJwtToken(token, [roleId], 0)).toEqual(
      expect.objectContaining({
        address: userId,
        roleIds: [roleId],
        nonce: 0,
      })
    );
  });
});
