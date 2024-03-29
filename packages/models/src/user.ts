import { importSPKI, jwtVerify, KeyLike } from "jose";
import { utils } from "ethers";
import { generateRolesFromIds, namespacedClaim, TokenModel } from "./token";

export interface IUser {
  address: string;
  nonce: number;
}

export interface IUserWithRoles {
  address: string;
  nonce: number;
  roleIds: string[];
}

export class UserTokenExpiredError extends Error {
  constructor() {
    super("User token has expired");
  }
}

export class UserTokenNoAddressError extends Error {
  constructor() {
    super("User token has no address");
  }
}

export class UserTokenNoNonceError extends Error {
  constructor() {
    super("User token has no nonce");
  }
}

export class UserTokenIssuerMismatchError extends Error {
  constructor() {
    super("User token issuer does not match");
  }
}

export class UserTokenRolesMismatchError extends Error {
  constructor() {
    super("User token roles does not match");
  }
}

/**
 *
 * @param token
 * @param roleIds
 * @param nonce
 * @returns {Promise<UserWithRolesModel>}
 * @throws UserTokenExpiredError | UserTokenNoAddressError | UserTokenNoNonceError | UserTokenIssuerMismatchError | UserTokenRolesMismatchError
 */
export async function verifyJwtToken(
  token: string,
  roleIds?: string[],
  nonce?: number
): Promise<UserWithRolesModel> {
  const result = await jwtVerify(token, await promisePublicKey, {
    ...generateRolesFromIds(roleIds),
    ...(typeof nonce === "number"
      ? {
          [namespacedClaim("nonce")]: nonce,
        }
      : {}),
    issuer: TokenModel.JWT_CLAIM_ISSUER,
  });
  if (result.payload.iss !== TokenModel.JWT_CLAIM_ISSUER) {
    throw new UserTokenIssuerMismatchError();
  }

  const address = result.payload.sub;
  if (!address) {
    throw new UserTokenNoAddressError();
  }
  const roleNamespace = namespacedClaim("role/");
  const roleIdsFromToken = Object.entries(result.payload)
    .filter(([k, v]) => v && k.includes(roleNamespace))
    .map(([k]) => k.replace(roleNamespace, ""));

  if (roleIds && roleIdsFromToken.length !== roleIds?.length) {
    throw new UserTokenRolesMismatchError();
  }
  for (const roleId of roleIdsFromToken) {
    if (roleIds && !roleIds.includes(roleId)) {
      throw new UserTokenRolesMismatchError();
    }
  }

  const expired =
    result.payload.exp && result.payload.exp * 1000 - Date.now() < 0;
  if (expired && result.payload.exp) {
    console.log("expiration on token", result.payload.exp * 1000, Date.now());
    throw new UserTokenExpiredError();
  }
  const nonceClaim = result.payload[namespacedClaim("nonce")] as string;
  if (typeof nonceClaim === "undefined") {
    throw new UserTokenNoNonceError();
  }
  return new UserWithRolesModel({
    address,
    nonce: +nonceClaim,
    roleIds: roleIdsFromToken,
  });
}

export class UserModel implements IUser {
  public readonly address: string;
  public readonly nonce: number;

  constructor(obj: IUser) {
    this.address = obj.address;
    this.nonce = obj.nonce;
  }

  public fromPartial(partial: Partial<IUser>): UserModel {
    return UserModel.fromJson({
      ...this.toJson(),
      ...partial,
    });
  }

  public static fromJson(json: any): UserModel {
    return new UserModel({
      address: json.address,
      nonce: json.nonce,
    });
  }

  public toJson(): IUser {
    return {
      address: this.address,
      nonce: this.nonce,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }

  public equals(other: UserModel): boolean {
    return this.address === other.address && this.nonce === other.nonce;
  }

  public clone(): UserModel {
    return new UserModel(this.toJson());
  }

  public static fromString(str: string): UserModel {
    return UserModel.fromJson(JSON.parse(str));
  }
}

export class UserWithRolesModel implements IUserWithRoles {
  public roleIds: string[];
  public get address(): `0x{string}` {
    if (!utils.isAddress(this._user.address)) {
      throw new Error("Invalid address");
    }
    return this._user.address as `0x{string}`;
  }
  public get nonce(): number {
    return this._user.nonce;
  }

  private _user: UserModel;

  constructor(obj: IUserWithRoles) {
    this._user = UserModel.fromJson(obj);
    this.roleIds = obj.roleIds;
  }

  public hasRole(roleId: string): boolean {
    return this.roleIds.includes(roleId);
  }

  public fromPartial(partial: Partial<IUserWithRoles>): UserWithRolesModel {
    return new UserWithRolesModel({
      ...this.toJson(),
      ...partial,
    });
  }

  public static fromJson(json: any): UserWithRolesModel {
    return new UserWithRolesModel({
      address: json.address,
      roleIds: json.roleIds,
      nonce: json.nonce,
    });
  }

  public toJson(): IUserWithRoles {
    return {
      address: this.address,
      roleIds: this.roleIds,
      nonce: this.nonce,
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJson());
  }
}

export const promisePublicKey = new Promise<KeyLike>(
  async (resolve, reject) => {
    if ((global as any).promisePrivateKeys) {
      await (global as any).promisePrivateKeys;
    }
    if (!process.env.NEXT_PUBLIC_JWT_PUBLIC_KEY) {
      resolve("" as any);
    }
    importSPKI(process.env.NEXT_PUBLIC_JWT_PUBLIC_KEY ?? "", "ECDH-ES+A128KW", {
      extractable: true,
    }).then(resolve, reject);
  }
);
