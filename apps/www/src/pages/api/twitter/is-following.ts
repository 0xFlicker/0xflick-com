import { NextApiRequest, NextApiResponse } from "next";
import {
  AccountUserDao,
  getDb,
  fetchTableNames,
  getAppTwitterClient,
  getAuthorizationToken,
  AccountProviderDao,
} from "@0xflick/backend";
import { EProviderTypes, verifyJwtToken } from "@0xflick/models";

const db = getDb();
const accountUserDao = new AccountUserDao(db);
const accountProviderDao = new AccountProviderDao(db);

if (!process.env.TWITTER_FOLLOW_USER_ID) {
  throw new Error("TWITTER_FOLLOW_USER_ID is not set");
}
const followTwitterUserId = process.env.TWITTER_FOLLOW_USER_ID;
const promiseTableNames = fetchTableNames();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await promiseTableNames;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const token = getAuthorizationToken(req);
  if (!token) {
    console.log("No token");
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    console.log("Verifying token");
    const user = await verifyJwtToken(token);
    if (!user) {
      console.error("unable to verify token");
      return res.status(401).json({ error: "Unauthorized" });
    }
    const accountUser = await accountUserDao.get(user.address);
    if (!accountUser) {
      return res.status(200).json({ needsLogin: true });
    }
    const providers = await accountProviderDao.getByAddress(
      accountUser.address
    );
    let provider = providers?.find(
      (p) => p.provider === EProviderTypes["TWITTER-V1"]
    );
    if (!provider) {
      return res.status(200).json({ needsLogin: true });
    }
    let following = accountUser.follower;
    if (
      !following &&
      provider.oauthV1Secret &&
      provider.oauthV1AccessToken &&
      provider.oauthV1Code
    ) {
      // Check the twitter api to see if they are now following the user
      const twitterClient = getAppTwitterClient({
        accessToken: provider.oauthV1AccessToken,
        accessSecret: provider.oauthV1Secret,
      });
      const { client: loggedInClient } = await twitterClient.login(
        provider.oauthV1Secret
      );
      const isFollowerResponse = await loggedInClient.v1.friendship({
        source_id: provider.providerAccountId,
        target_id: followTwitterUserId,
      });
      if (isFollowerResponse.relationship.source.following !== following) {
        following = isFollowerResponse.relationship.source.following;
        await accountUserDao.create({
          ...accountUser,
          follower: following,
        });
      }
    }

    return res.status(200).json({ following });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
