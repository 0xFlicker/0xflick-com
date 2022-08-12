import { createJwtToken, decryptJweToken } from "@0xflick/backend";
import { authMessage, IUser } from "@0xflick/models";
import { IFieldResolver } from "@graphql-tools/utils";
import { utils } from "ethers";
import { TContext } from "../../context";
import { AuthError } from "../../errors/auth";
import { TGraphqlResolver } from "../../types";

export interface IGraphqlWeb3LoginUser {
  address: string;
  user: IUser;
  token: string;
}

export const mutationSchema = `
  signIn(address: String!, jwe: String!): Web3LoginUser
`;

export const mutations = {
  signIn: (async (
    _,
    { address, jwe },
    { userDao, userRolesDao, setToken, clearToken }
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
    const userAuthMessage = authMessage(nonce.toString());
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
    setToken(token);
    return {
      address,
      user: {
        address,
        nonce,
      },
      token,
    };
  }) as IFieldResolver<
    any,
    TContext,
    { address: string; jwe: string },
    Promise<IGraphqlWeb3LoginUser>
  >,
} as TGraphqlResolver;
