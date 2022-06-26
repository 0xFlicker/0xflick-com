import { v4 as createUuid } from "uuid";
import { getDb } from "backend/db/dynamodb";
import { RolePermissionsDAO } from "backend/db/rolePermissions";
import {
  fetchTableNames,
  getAuthorizationToken,
  getOwner,
} from "backend/helpers";
import { EActions, EResource } from "models/permissions";
import { verifyJwtToken } from "models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import { RolesDAO } from "backend/db/roles";
import {
  defaultAdminStrategyAll,
  isActionOnResource,
} from "utils/allowedActions";
import {
  IRolePermission,
  IRolePermissionsAddResponseSuccess,
} from "models/rolePermissions";

interface IDataError {
  error: string;
}

const db = getDb();
const rolesDao = new RolesDAO(db);
const rolePermissionsDao = new RolePermissionsDAO(db);
const promiseOwner = getOwner();
const canPerformAction = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.ROLE,
  })
);
const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IRolePermissionsAddResponseSuccess | IDataError>
) {
  await promiseTableNames;
  try {
    if (req.method !== "PUT") {
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
      let isAuthorized = canPerformAction(permissions);
      if (!isAuthorized && (await promiseOwner()) === user.address) {
        isAuthorized = true;
      }
      if (!isAuthorized) {
        console.log(
          `Failed to authorize user ${
            user.address
          } to add role. Reason: ${canPerformAction.describe(permissions)}`
        );
        return res.status(403).json({ error: "Forbidden" });
      }
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body) {
        return res.status(400).json({ error: "Missing body" });
      }
      if (!body.name) {
        return res.status(400).json({ error: "Missing name" });
      }
      const permissionsToAdd: undefined | Omit<IRolePermission, "roleId">[] =
        body.permissions;

      const id = createUuid();
      await rolesDao.create({
        id,
        name: body.name,
      });
      if (permissionsToAdd) {
        await Promise.all(
          permissionsToAdd.map((permission) =>
            rolePermissionsDao.bind({
              roleId: id,
              ...permission,
            })
          )
        );
      }
      return res.status(200).json({ id });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: "Failed" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
