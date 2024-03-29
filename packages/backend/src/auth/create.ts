import type { NextApiRequest, NextApiResponse } from "next";
import { utils } from "ethers";
import { getDb } from "../db/dynamodb";
import { UserDAO } from "../db/user";
import { authMessage, TokenModel } from "@0xflick/models";
import { createJwtToken, decryptJweToken } from "../db/token";
import { UserRolesDAO } from "../db/userRoles";
import { fetchTableNames, getOwner } from "../helpers";
import { serializeSessionCookie } from "../utils/cookie";

interface IDataSuccess {
  token: string;
}
interface IDataError {
  error: string;
}

const db = getDb();
const userDao = new UserDAO(db);
const userRolesDao = new UserRolesDAO(db);

const promiseTableNames = fetchTableNames();

if (!process.env.SIWE_EXPIRATION_TIME_SECONDS) {
  throw new Error("SIWE_EXPIRATION_TIME_SECONDS is not set");
}
const siweExpirationTime =
  parseInt(process.env.SIWE_EXPIRATION_TIME_SECONDS, 10) * 1000;
if (!process.env.NEXT_PUBLIC_APP_NAME) {
  throw new Error("NEXT_PUBLIC_APP_NAME is not set");
}
const appName = process.env.NEXT_PUBLIC_APP_NAME;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataSuccess | IDataError>
) {
  await promiseTableNames;
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const addressParam = req.query.address;
    if (!addressParam) {
      return res.status(400).json({ error: "Address is required" });
    }
    const address = Array.isArray(addressParam)
      ? addressParam[0]
      : addressParam;
    if (!utils.isAddress(address)) {
      return res.status(400).json({ error: "Address is invalid" });
    }

    // The body of the request contains the signature of the message
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { jwe, issuedAt, chainId } = body as {
      jwe: string;
      issuedAt: number;
      chainId: number;
    };
    if (!jwe) {
      return res.status(400).json({ error: "JWE is required" });
    }

    // Check if the user is already registered
    const userFromDb = await userDao.getUserWithRoles(userRolesDao, address);

    // Decrypt the JWE, to retrieve the signature
    const { protectedHeader, plaintext } = await decryptJweToken(jwe);
    const signature = Buffer.from(plaintext).toString("utf8");
    const nonce: number = Number(protectedHeader.kid);

    const nonceFromDb = userFromDb ? userFromDb.nonce : 0;

    if (nonceFromDb !== nonce) {
      return res.status(400).json({ error: "Nonce is invalid" });
    }
    const userAuthMessage = authMessage({
      address,
      chainId,
      domain: appName,
      expirationTime: issuedAt + siweExpirationTime,
      issuedAt,
      nonce: nonce.toString(),
      uri: TokenModel.JWT_CLAIM_ISSUER,
      version: "1",
    });
    const verifiedAddress = utils.verifyMessage(userAuthMessage, signature);
    if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: "Signature is invalid" });
    }
    const roleIds = userFromDb?.roleIds ?? [];
    // Create the jwt token
    let token: string;
    if (userFromDb) {
      token = await createJwtToken({
        address,
        nonce: userFromDb.nonce,
        roleIds,
      });
    } else {
      token = await createJwtToken({
        address,
        nonce,
        roleIds,
      });
    }
    // Increment the nonce
    if (userFromDb) {
      await userDao.incSessionNonce(address);
    } else {
      await userDao.create({ address });
    }
    res
      .status(200)
      .setHeader("set-cookie", serializeSessionCookie(token, "/api/"));
    return res.json({
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
