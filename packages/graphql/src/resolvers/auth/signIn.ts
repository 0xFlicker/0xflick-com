import {
  createJwtToken,
  createLogger,
  decryptJweToken,
} from "@0xflick/backend";
import { authMessage, IUser } from "@0xflick/models";
import { utils } from "ethers";
import { TContext } from "../../context";
import { AuthError } from "../../errors/auth";
import { Resolvers } from "../../resolvers.generated";

const logger = createLogger({
  name: "graphql/resolvers/auth/signIn",
});

export const mutations: Resolvers<TContext>["Mutation"] = {
  signIn: async (
    _,
    { address, jwe, issuedAt: issuedAtStr, chainId },
    { userDao, userRolesDao, setToken, clearToken, config }
  ) => {
    // Check if the user is already registered
    const userFromDb = await userDao.getUserWithRoles(userRolesDao, address);

    // Decrypt the JWE, to retrieve the signature
    const { protectedHeader, plaintext } = await decryptJweToken(jwe);
    const signature = Buffer.from(plaintext).toString("utf8");
    const nonce: number = Number(protectedHeader.kid);
    const nonceFromDb = userFromDb ? userFromDb.nonce : 0;

    if (nonceFromDb !== nonce) {
      clearToken();
      throw new AuthError("Invalid nonce", "INVALID_NONCE");
    }
    const issuedAt = Number(issuedAtStr);
    const userAuthMessage = authMessage({
      address,
      chainId,
      domain: config.swie.domain,
      expirationTime: issuedAt + config.swie.expirationTime,
      issuedAt,
      nonce: nonce.toString(),
      uri: config.swie.uri,
      version: config.swie.version,
    });
    console.log("userAuthMessage", userAuthMessage);
    const verifiedAddress = utils.verifyMessage(userAuthMessage, signature);
    if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
      clearToken();
      throw new AuthError("Invalid signature", "INVALID_SIGNATURE");
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
    logger.info(`Logging in user ${address}`);
    setToken(token);
    return {
      address,
      user: {
        address,
        nonce,
      },
      token,
    };
  },
};
