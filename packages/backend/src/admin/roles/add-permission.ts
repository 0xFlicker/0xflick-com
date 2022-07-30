import { getDb } from "../../db/dynamodb";
import { RolePermissionsDAO } from "../../db/rolePermissions";
import {
  getAuthorizationToken,
  getOwner,
  fetchTableNames,
} from "../../helpers";
import {
  EActions,
  EResource,
  isAction,
  isResource,
} from "@0xflick/models/permissions";
import { verifyJwtToken } from "@0xflick/models/user";
import type { NextApiRequest, NextApiResponse } from "next";
import { RolesDAO } from "../../db/roles";
import {
  defaultAdminStrategyAll,
  isActionOnResource,
} from "../../utils/allowedActions";

type TSuccess = "OK";

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
    action: EActions.UPDATE,
    resource: EResource.ROLE,
  })
);
const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TSuccess | IDataError>
) {
  await promiseTableNames;
  try {
    if (req.method !== "POST") {
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
          } to add permission to role. Reason: ${canPerformAction.describe(
            permissions
          )}`
        );
        return res.status(403).json({ error: "Forbidden" });
      }
      const body: {
        roleId: string;
        action: string;
        resource: string;
        identifier?: string;
      } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body) {
        return res.status(400).json({ error: "Missing body" });
      }
      if (!body.roleId) {
        return res.status(400).json({ error: "Missing roleId" });
      }
      if (!body.action) {
        return res.status(400).json({ error: "Missing action" });
      }
      if (!body.resource) {
        return res.status(400).json({ error: "Missing resource" });
      }

      const { roleId, action, resource, identifier } = body;
      if (!isAction(action)) {
        return res.status(400).json({ error: "Invalid action" });
      }
      if (!isResource(resource)) {
        return res.status(400).json({ error: "Invalid resource" });
      }

      // Fetch role from DB
      const role = await rolesDao.get(body.roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      await rolePermissionsDao.bind({
        roleId: role.id,
        action: action,
        resource: resource,
        identifier: identifier,
      });

      return res.status(200).send("OK");
    } catch (err: any) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
