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
  const { getToken, rolePermissionsDao, ownerForChain } = context;
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
