import { TAllowedAction, verifyJwtToken } from "@0xflick/models";
import { defaultChainId } from "@0xflick/backend";
import { TContext } from "../../context";
import { AuthError } from "../../errors/auth";

export async function verifyAuthorizedUser(
  { getToken, rolePermissionsDao, ownerForChain }: TContext,
  authorizer: (item: TAllowedAction[]) => boolean
) {
  const token = getToken();
  if (!token) {
    throw new AuthError("Not authenticated", "NOT_AUTHENTICATED");
  }
  const user = await verifyJwtToken(token);
  if (!user) {
    throw new AuthError("Invalid token", "NOT_AUTHENTICATED");
  }

  const permissionsFromDb = await rolePermissionsDao.allowedActionsForRoleIds(
    user.roleIds
  );

  let isAuthorized = authorizer(permissionsFromDb);
  const contractOwner = await ownerForChain(Number(defaultChainId()));
  if (!isAuthorized && contractOwner === user.address) {
    isAuthorized = true;
  }
  if (!isAuthorized) {
    throw new AuthError("Forbidden", "NOT_AUTHORIZED");
  }
  return user;
}
