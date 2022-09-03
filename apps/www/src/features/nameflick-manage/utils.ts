import {
  INameflickMetadata,
  INameflickToken,
  subdomainFromEnsName,
} from "@0xflick/models";
import { publicImageResizerUrl } from "utils/config";

export function tokenToUrl(token: INameflickToken) {
  const wrappedEns = token.metadata?.wrappedEns;
  const ensName = wrappedEns ?? "unassigned";
  return `${publicImageResizerUrl.get()}/nameflick-image/${encodeURIComponent(
    ensName
  )}/${token.tokenId}`;
}

export function tokenToStatusDescription(status: INameflickMetadata["status"]) {
  switch (status) {
    case "FREE_USE":
      return "Free to use. Allows you to claim and use one sub-domain on nameflick.eth";
    case "PERSONAL_USE":
      return "Wrapped ENS. Allows you to set unlimited sub-domains and records on one ENS name";
    case "COMMUNITY_USE":
      return "Community use. Allows you to set unlimited sub-domains and records on one ENS name and use it as a community";
    case "PREMIUM_USE":
      return "Power mode enabled";
    default:
      return "Unknown";
  }
}
