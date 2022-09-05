import { IDeployConfig } from "@0xflick/backend";
import { TokenModel } from "@0xflick/models";

const siweExpirationTime =
  (parseInt(process.env.SIWE_EXPIRATION_TIME_SECONDS, 10) || 60 * 60 * 24 * 7) *
  1000;

const appName =
  process.env.NEXT_PUBLIC_APP_NAME || "PUBLIC_APP_NAME_NOT_DEFINED";

const publicEnsDomain =
  process.env.NEXT_PUBLIC_ENS_DOMAIN || "public.nameflick.eth";

const adminEnsDomain = process.env.ADMIN_ENS_DOMAIN || "admin.nameflick.eth";

const twitterFollowUserId = process.env.TWITTER_FOLLOW_USER_ID || "";
const twitterFollowName =
  process.env.NEXT_PUBLIC_TWITTER_FOLLOW_NAME || "@UNKNOWN";

export function createConfig(providedConfig: Partial<IDeployConfig>) {
  const config = {
    chains: providedConfig.chains,
    infraIpfsProjectId: providedConfig.infraIpfsProjectId,
    infraIpfsSecret: providedConfig.infraIpfsSecret,
    infraIpfsUrl: providedConfig.infraIpfsUrl,
    publicEnsDomain,
    adminEnsDomain,
    twitterFollowUserId,
    twitterFollowName,
    swie: {
      expirationTime: siweExpirationTime,
      domain: appName,
      version: "1",
      uri: TokenModel.JWT_CLAIM_ISSUER,
    },
  };

  return config;
}
