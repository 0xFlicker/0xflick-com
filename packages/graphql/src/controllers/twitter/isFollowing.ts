import { EProviderTypes, IUser } from "@0xflick/models";
import { getAppTwitterClient } from "@0xflick/backend";
import { TContext } from "../../context";
import { AuthError } from "../../errors/auth";
import { TwitterError } from "../../errors/twitter";

export async function isTwitterFollowing(context: TContext, user: IUser) {
  const { accountProviderDao, accountUserDao, config } = context;
  const accountUser = await accountUserDao.get(user.address);
  if (!accountUser) {
    throw new AuthError("Not authenticated", "NOT_AUTHENTICATED");
  }
  const providers = await accountProviderDao.getByAddress(accountUser.address);
  let provider = providers?.find(
    (p) => p.provider === EProviderTypes["TWITTER-V1"]
  );
  if (!provider) {
    throw new TwitterError("Twitter provider not found", "NO_PROVIDER");
  }
  let twitterFollower = accountUser.twitterFollower;
  if (
    !twitterFollower &&
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
      target_id: config.twitterFollowUserId,
    });
    if (isFollowerResponse.relationship.source.following !== twitterFollower) {
      twitterFollower = isFollowerResponse.relationship.source.following;
      await accountUserDao.create({
        ...accountUser,
        twitterFollower: twitterFollower,
      });
    }
  }
  return twitterFollower;
}
