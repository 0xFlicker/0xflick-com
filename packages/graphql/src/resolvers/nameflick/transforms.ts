import { INameFlick } from "@0xflick/models";
import { Nameflick } from "../../types.generated";

export function nameflickModelToGraphql(nameflickModel: INameFlick): Nameflick {
  const rootDomain = nameflickModel.normalized.split(".").slice(-2).join(".");
  return {
    domain: nameflickModel.normalized,
    ensHash: nameflickModel.ensHash,
    rootDomain,
    ttl: nameflickModel.ttl,
    addresses: {
      eth: nameflickModel.addresses.ETH,
      btc: nameflickModel.addresses.BTC,
      ltc: nameflickModel.addresses.LTC,
      doge: nameflickModel.addresses.DOGE,
    },
    content: nameflickModel.content,
    textRecord: {
      email: nameflickModel.textRecord.email,
      avatar: nameflickModel.textRecord.avatar,
      description: nameflickModel.textRecord.description,
      comDiscord: nameflickModel.textRecord["com.discord"],
      comGithub: nameflickModel.textRecord["com.github"],
      url: nameflickModel.textRecord.url,
      notice: nameflickModel.textRecord.notice,
      keywords: nameflickModel.textRecord.keywords,
      comReddit: nameflickModel.textRecord["com.reddit"],
      comTwitter: nameflickModel.textRecord["com.twitter"],
      orgTelegram: nameflickModel.textRecord["org.telegram"],
    },
  };
}
