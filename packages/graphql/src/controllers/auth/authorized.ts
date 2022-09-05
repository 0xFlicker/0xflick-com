import { TAllowedAction, verifyJwtToken } from "@0xflick/models";
import { defaultChainId } from "@0xflick/backend";
import { TContext } from "../../context";
import { AuthError } from "../../errors/auth";
import { authorizedUser } from "./user";

export async function verifyAuthorizedUser(
  context: TContext,
  authorizer: (item: TAllowedAction[]) => boolean
) {
  const user = await authorizedUser(context);
  const { rolePermissionsDao, providerForChain, config } = context;
  const permissionsFromDb = await rolePermissionsDao.allowedActionsForRoleIds(
    user.roleIds
  );

  let isAuthorized = authorizer(permissionsFromDb);
  if (isAuthorized) {
    return user;
  }
  const provider = providerForChain(Number(defaultChainId()));
  const adminEns = config.adminEnsDomain;
  const adminAddress = await provider.resolveName(adminEns);
  if (adminAddress === user.address) {
    isAuthorized = true;
  }
  if (!isAuthorized) {
    throw new AuthError("Forbidden", "NOT_AUTHORIZED");
  }
  return user;
}
