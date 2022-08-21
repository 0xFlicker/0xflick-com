import { TContext } from "../../context";

export async function fetchNameflickRecordByFqdn(
  context: TContext,
  { fqdn }: { fqdn: string }
) {
  const { nameFlickDao } = context;
  return await nameFlickDao.getByNormalizedName(fqdn);
}

export async function fetchNameflickRecordByEnsHash(
  context: TContext,
  { ensHash }: { ensHash: string }
) {
  const { nameFlickDao } = context;
  return await nameFlickDao.getByEnsHash(ensHash);
}

export async function fetchNameflickRecordsByRootDomain(
  context: TContext,
  { rootDomain }: { rootDomain: string }
) {
  const { nameFlickDao } = context;
  return await nameFlickDao.getByRootDomainName(rootDomain);
}
