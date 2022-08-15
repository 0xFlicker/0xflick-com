import { verifyJwtToken } from "@0xflick/models";
import { TContext } from "../../context";
import { AuthError } from "../../errors/auth";

export async function authorizedUser({ getToken }: TContext) {
  const token = getToken();
  if (!token) {
    throw new AuthError("Not authenticated", "NOT_AUTHENTICATED");
  }
  const user = await verifyJwtToken(token);
  if (!user) {
    throw new AuthError("Invalid token", "NOT_AUTHENTICATED");
  }

  return user;
}
