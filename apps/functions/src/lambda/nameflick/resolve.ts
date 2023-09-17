import { NameFlickDAO } from "@0xflick/backend";
import { coinTypeToName, INameFlickTextRecord } from "@0xflick/models";
import ch from "content-hash";
import { utils } from "ethers";
import { friendFromUsername } from "./ft";
import { DatabaseResult } from "./types";

export async function resolveFriendCoinAddress(
  name: string,
  fqn: string,
  nameflickDao: NameFlickDAO
) {
  const nameflick = await nameflickDao.getByNormalizedName(fqn);

  let friendCoinAddress = nameflick?.friendTechAddress;
  if (!friendCoinAddress) {
    // see if we can find it from the friend's twitter username
    const user = await friendFromUsername(name);
    if (user) {
      friendCoinAddress = user.address;
    }
    const avatar = user.twitterPfpUrl;
    // save address and avatar
    await nameflickDao.createOrUpdate({
      ensHash: utils.namehash(fqn),
      addresses: {
        ETH: friendCoinAddress,
      },
      friendTechAddress: friendCoinAddress,
      // 1 week
      ttl: (Date.now() + 1000 * 60 * 60 * 24 * 7) / 1000,
      textRecord: {
        avatar,
      },
    });
  }

  return {
    result: [friendCoinAddress],
    ttl: nameflick.ttl ?? 0,
  };
}

export async function resolveCoinAddress(
  name: string,
  coinTypeIndex: number,
  nameflickDao: NameFlickDAO
): Promise<DatabaseResult | null> {
  const coinType = coinTypeToName(coinTypeIndex);
  console.log(`Resolving ${coinType} for domain ${name}`);
  const nameflick = await nameflickDao.getByNormalizedName(name);
  const resolvedCoin = nameflick.addresses[coinType];
  if (!nameflick || !resolvedCoin) {
    return null;
  }

  return {
    result: [resolvedCoin],
    ttl: nameflick.ttl ?? 0,
  };
}

export async function resolveContent(name: string, nameflickDao: NameFlickDAO) {
  const nameflick = await nameflickDao.getByNormalizedName(name);
  console.log(
    `Resolving content for domain ${name}: ${JSON.stringify(nameflick)}`
  );
  if (!nameflick || !nameflick.content) {
    return null;
  }
  const contentHash = `0x${ch.fromIpfs(nameflick.content)}`;
  console.log(`Resolved content hash: ${contentHash}`);
  return {
    result: [contentHash],
    ttl: nameflick.ttl ?? 0,
  };
}

export async function resolveFriendAvatar(
  name: string,
  fqdn: string,
  nameflickDao: NameFlickDAO
) {
  const nameflick = await nameflickDao.getByNormalizedName(fqdn);

  let avatar = nameflick?.textRecord?.avatar;

  if (!avatar) {
    // see if we can find it from the friend's twitter username
    const user = await friendFromUsername(name);
    if (user) {
      avatar = user.twitterPfpUrl;
    }
    const address = user.address;
    // save address and avatar
    await nameflickDao.createOrUpdate({
      ensHash: utils.namehash(fqdn),
      addresses: {
        ETH: address,
      },
      friendTechAddress: address,
      // 1 week
      ttl: (Date.now() + 1000 * 60 * 60 * 24 * 7) / 1000,
      textRecord: {
        avatar,
      },
    });
  }
  return {
    result: [avatar],
    ttl: nameflick.ttl ?? 0,
  };
}

export async function resolveTextRecord(
  name: string,
  fieldName: keyof INameFlickTextRecord,
  nameflickDao: NameFlickDAO
) {
  const nameflick = await nameflickDao.getByNormalizedName(name);
  console.log(
    `Resolving record for domain ${name}:${fieldName} ${JSON.stringify(
      nameflick
    )}`
  );
  if (!nameflick || !nameflick.textRecord[fieldName]) {
    return null;
  }
  return {
    result: [nameflick.textRecord[fieldName]],
    ttl: nameflick.ttl ?? 0,
  };
}
