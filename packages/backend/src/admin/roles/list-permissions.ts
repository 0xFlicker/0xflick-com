import { getDb } from "backend/db/dynamodb";
import { RolePermissionsDAO } from "backend/db/rolePermissions";
import { fetchTableNames, getAuthorizationToken } from "backend/helpers";
import { EActions, EResource } from "models/permissions";
import { verifyJwtToken } from "models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  defaultAdminStrategyAll,
  isActionOnResource,
} from "utils/allowedActions";
import type {
  IRolePermission,
  TRolePermissionsListResponseSuccess,
} from "models/rolePermissions";

interface IDataError {
  error: string;
}

const db = getDb();
const rolePermissionsDao = new RolePermissionsDAO(db);

const canPerformAction = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.LIST,
    resource: EResource.ROLE,
  })
);

const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TRolePermissionsListResponseSuccess | IDataError>
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
    const roleIdArray = req.query.roleIds;
    if (!roleIdArray) {
      return res.status(400).json({ error: "Missing roleId" });
    }
    const roleIds = Array.isArray(roleIdArray) ? roleIdArray : [roleIdArray];

    try {
      const user = await verifyJwtToken(token);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Check if user has the required roles
      const userPermissions = await rolePermissionsDao.allowedActionsForRoleIds(
        user.roleIds
      );
      const isAuthorized =
        user.roleIds.some((roleId) => roleIds.includes(roleId)) ||
        canPerformAction(userPermissions);

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
        const allPermissionAsyncIterators = await Promise.all(
          roleIds.map((roleId) => rolePermissionsDao.getPermissions(roleId))
        );
        const allPermissions: Omit<IRolePermission, "roleId">[] = [];
        for (const asyncIterator of allPermissionAsyncIterators) {
          for await (const permission of asyncIterator) {
            allPermissions.push({
              action: permission.action,
              resource: permission.resource,
              identifier: permission.identifier,
            });
          }
        }

        return res.status(200).json(allPermissions);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error loading permission" });
      }
    } catch (err: any) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
