import { getDb } from "../../db/dynamodb";
import { RolePermissionsDAO } from "../../db/rolePermissions";
import { UserDAO } from "../../db/user";
import { UserRolesDAO } from "../../db/userRoles";
import {
  fetchTableNames,
  getAuthorizationToken,
  getOwner,
} from "../../helpers";
import {
  EActions,
  EResource,
  defaultAdminStrategyAll,
  isActionOnResource,
  verifyJwtToken,
} from "@0xflick/models";
import type { NextApiRequest, NextApiResponse } from "next";
import { RolesDAO } from "../../db/roles";

type TSuccess = "OK";

interface IDataError {
  error: string;
}

const db = getDb();
const rolesDao = new RolesDAO(db);
const userDao = new UserDAO(db);
const userRolesDao = new UserRolesDAO(db);
const rolePermissionsDao = new RolePermissionsDAO(db);

const promiseOwner = getOwner();

const canPerformAction = defaultAdminStrategyAll(
  EResource.USER_ROLE,
  isActionOnResource({
    action: EActions.CREATE,
    resource: EResource.USER_ROLE,
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

      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body) {
        return res.status(400).json({ error: "Missing body" });
      }
      if (!body.roleId) {
        return res.status(400).json({ error: "Missing roleId" });
      }

      if (!body.address) {
        return res.status(400).json({ error: "Missing address" });
      }

      // Fetch role from DB
      const role = await rolesDao.get(body.roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
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
          `Failed to authorize user ${user.address} to add role ${
            role.name
          } to user ${body.address}. Reason: ${canPerformAction.describe(
            permissions
          )}`
        );
        return res.status(403).json({ error: "Forbidden" });
      }

      // Fetch permission from DB
      const userFromDb = await userDao.getUser(body.address);
      const userModel =
        userFromDb ??
        (await userDao.create({
          address: body.address,
        }));

      await userRolesDao.bind({
        address: userModel.address,
        roleId: role.id,
        rolesDao,
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
