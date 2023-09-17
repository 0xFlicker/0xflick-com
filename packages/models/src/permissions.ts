export enum EActions {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  USE = "use",
  ADMIN = "admin",
}

export enum EResource {
  ALL = "all",
  USER = "user",
  USER_ROLE = "user_role",
  ADMIN = "admin",
  PRESALE = "presale",
  FAUCET = "faucet",
  PERMISSION = "permission",
  ROLE = "role",
  AFFILIATE = "affiliate",
  NFT_METADATA_JOB = "nft_metadata_job",
}
export function isAction(possibleAction: string): possibleAction is EActions {
  return Object.values(EActions).includes(possibleAction as EActions);
}

export function isResource(
  possibleResource: string
): possibleResource is EResource {
  return Object.values(EResource).includes(possibleResource as EResource);
}
