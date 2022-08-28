import { GraphQLResolveInfo } from "graphql";
import { INameflick } from "@0xflick/models";
import { TContext } from "../../context";
import { NameflickFieldsInput } from "../../types.generated";
import { utils } from "ethers";
import { NameflickError } from "../../errors/nameflick";

export async function createOrUpdateNameFlickRecord(
  context: TContext,
  info: GraphQLResolveInfo,
  domain: string,
  ttl: number | null,
  nameflick: NameflickFieldsInput
) {
  context.requireMutation(info);
  const {
    nameFlickDao,
    config: { publicEnsDomain },
  } = context;
  if (!domain.endsWith(publicEnsDomain)) {
    throw new NameflickError(
      "Only public domains are allowed",
      "NOT_AUTHORIZED_TO_UPDATE_NAMEFLICK",
      domain
    );
  }
  let ensHash: string | undefined = undefined;
  if (!domain.startsWith("*")) {
    ensHash = utils.namehash(domain);
  }

  const model = {
    normalized: domain,
    ensHash,
    ttl,
    addresses: {
      ETH: nameflick.addresses?.eth,
      BTC: nameflick.addresses?.btc,
      LTC: nameflick.addresses?.ltc,
      DOGE: nameflick.addresses?.doge,
    },
    content: nameflick.content,
    textRecord: {
      email: nameflick.textRecord?.email,
      avatar: nameflick.textRecord?.avatar,
      description: nameflick.textRecord?.description,
      "com.discord": nameflick.textRecord?.comDiscord,
      "com.github": nameflick.textRecord?.comGithub,
      url: nameflick.textRecord?.url,
      notice: nameflick.textRecord?.notice,
      keywords: nameflick.textRecord?.keywords,
      "com.reddit": nameflick.textRecord?.comReddit,
      "com.twitter": nameflick.textRecord?.comTwitter,
      "org.telegram": nameflick.textRecord?.orgTelegram,
    },
  };
  await nameFlickDao.createOrUpdate(model);
  return model;
}
