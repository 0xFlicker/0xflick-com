import { getDb } from "backend/db/dynamodb";
import { RolesDAO } from "backend/db/roles";
import { RolePermissionsDAO } from "backend/db/rolePermissions";
import {
  fetchTableNames,
  getAuthorizationToken,
  paginationOptions,
  toPaginationResponse,
} from "backend/helpers";
import { EActions, EResource } from "models/permissions";
import { verifyJwtToken } from "models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultAdminStrategyAll,
  isActionOnResource,
} from "utils/allowedActions";
import { IRole } from "models/roles";
import { UserRolesDAO } from "backend/db/userRoles";

interface IDataError {
  error: string;
}

const db = getDb();
const rolesDao = new RolesDAO(db);
const userRolesDao = new UserRolesDAO(db);
const rolePermissionsDao = new RolePermissionsDAO(db);

const canPerformAction = defaultAdminStrategyAll(
  EResource.ROLE,
  isActionOnResource({
    action: EActions.DELETE,
    resource: EResource.ROLE,
  })
);
const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | IDataError>
) {
  await promiseTableNames;
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const token = getAuthorizationToken(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const roleIdArray = req.query.roleId;
    if (!roleIdArray) {
      return res.status(400).json({ error: "Missing roleId" });
    }
    const roleId = Array.isArray(roleIdArray) ? roleIdArray[0] : roleIdArray;

    try {
      const user = await verifyJwtToken(token);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Check if user has the required roles
      const userPermissions = await rolePermissionsDao.allowedActionsForRoleIds(
        user.roleIds
      );
      const isAuthorized = canPerformAction(userPermissions);

      if (!isAuthorized) {
        console.log(
          `Failed to authorize user ${
            user.address
          } to list permission. Reason: ${canPerformAction.describe(
            userPermissions
          )}`
        );
        return res.status(403).json({ error: "Forbidden" });
      }

      try {
        const response = await rolesDao.deleteRole(
          userRolesDao,
          rolePermissionsDao,
          roleId
        );
        if (!response) {
          return res.status(404).json({ error: "Role not found" });
        }
        return res.status(200).json("OK");
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error loading role" });
      }
    } catch (err: any) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
