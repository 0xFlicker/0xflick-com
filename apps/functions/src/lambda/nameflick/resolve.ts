import { NameFlickDAO } from "@0xflick/backend";
import { coinTypeToName, INameFlickTextRecord } from "@0xflick/models";
import ch from "content-hash";
import { DatabaseResult } from "./types";

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
