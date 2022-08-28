import { GraphQLResolveInfo } from "graphql";
import { INameflick } from "@0xflick/models";
import { TContext } from "../../context";
import { NameflickError } from "../../errors/nameflick";

export async function deleteNameflickRecordByFqdn(
  context: TContext,
  info: GraphQLResolveInfo,
  fqdn: string
) {
  context.requireMutation(info);

  const {
    nameFlickDao,
    config: { publicEnsDomain },
  } = context;
  if (!fqdn.endsWith(publicEnsDomain)) {
    throw new NameflickError(
      "Only public domains are allowed",
      "NOT_AUTHORIZED_TO_UPDATE_NAMEFLICK",
      fqdn
    );
  }
  await nameFlickDao.deleteByFqdn(fqdn);
}
