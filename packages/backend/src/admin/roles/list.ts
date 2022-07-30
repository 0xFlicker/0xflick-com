import { getDb } from "../../db/dynamodb";
import { RolePermissionsDAO } from "../../db/rolePermissions";
import {
  fetchTableNames,
  getAuthorizationToken,
  paginationOptions,
  toPaginationResponse,
} from "../../helpers";
import { EActions, EResource } from "@0xflick/models/permissions";
import { verifyJwtToken } from "@0xflick/models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultAdminStrategyAll,
  isActionOnResource,
} from "../../utils/allowedActions";
import { IRoleListResponseSuccess } from "@0xflick/models/roles";
import { RolesDAO } from "../../db/roles";

interface IDataError {
  error: string;
}

const db = getDb();
const rolePermissionsDao = new RolePermissionsDAO(db);
const rolesDao = new RolesDAO(db);

const canPerformAction = defaultAdminStrategyAll(
  EResource.ROLE,
  isActionOnResource({
    action: EActions.LIST,
    resource: EResource.ROLE,
  })
);

const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IRoleListResponseSuccess | IDataError>
) {
  await promiseTableNames;
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const token = getAuthorizationToken(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const user = await verifyJwtToken(token);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Check if user has the required roles
      const permissions = await rolePermissionsDao.allowedActionsForRoleIds(
        user.roleIds
      );
      const isAuthorized = canPerformAction(permissions);

      if (!isAuthorized) {
        console.log(
          `Failed to authorize user ${
            user.address
          } to list permission. Reason: ${canPerformAction.describe(
            permissions
          )}`
        );
        return res.status(403).json({ error: "Forbidden" });
      }

      try {
        const paginatedResponse = await rolesDao.listAllPaginated(
          paginationOptions(req)
        );

        if (!paginatedResponse) {
          return res.status(404).json({ error: "Role not found" });
        }
        return res.status(200).json(toPaginationResponse(paginatedResponse));
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error loading roles" });
      }
    } catch (err: any) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
