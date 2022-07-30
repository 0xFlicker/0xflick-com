import { getDb } from "../../db/dynamodb";
import { RolePermissionsDAO } from "../../db/rolePermissions";
import { UserRolesDAO } from "../../db/userRoles";
import { fetchTableNames, getAuthorizationToken } from "../../helpers";
import {
  EActions,
  EResource,
  defaultAdminStrategyAll,
  isActionOnResource,
  verifyJwtToken,
  IRolePermissionsListAddressesResponseSuccess,
} from "@0xflick/models";
import type { NextApiRequest, NextApiResponse } from "next";
import { RolesDAO } from "../../db/roles";
import type { IPaginationOptions } from "../../types";

interface IDataError {
  error: string;
}

const db = getDb();
const rolesDao = new RolesDAO(db);
const userRolesDao = new UserRolesDAO(db);
const rolePermissionsDao = new RolePermissionsDAO(db);

const canPerformAction = defaultAdminStrategyAll(
  EResource.PERMISSION,
  isActionOnResource({
    action: EActions.LIST,
    resource: EResource.USER_ROLE,
  })
);

const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    IRolePermissionsListAddressesResponseSuccess | IDataError
  >
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
      // Check if user has the required roles
      const permissions = await rolePermissionsDao.allowedActionsForRoleIds(
        user.roleIds
      );
      const isAuthorized = canPerformAction(permissions);

      if (!isAuthorized) {
        console.log(
          `Failed to authorize user ${
            user.address
          } to list user role. Reason: ${canPerformAction.describe(
            permissions
          )}`
        );
        return res.status(403).json({ error: "Forbidden" });
      }
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body) {
        return res.status(400).json({ error: "Missing body" });
      }
      if (!body.roleId) {
        return res.status(400).json({ error: "Missing roleId" });
      }

      // Fetch role from DB
      const role = await rolesDao.get(body.roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      let pagination: IPaginationOptions | undefined = undefined;
      if (body.pagination) {
        pagination = {};
        if (body.pagination.limit) {
          pagination.limit = body.pagination.limit;
        }
        if (body.pagination.cursor) {
          pagination.cursor = body.pagination.cursor;
        }
      }

      const addressesResponse = await userRolesDao.getAddressesPaginated(
        role.id,
        pagination
      );

      return res.status(200).json({
        items: addressesResponse.items,
        count: addressesResponse.count,
        page: addressesResponse.page,
        ...(addressesResponse.cursor && { cursor: addressesResponse.cursor }),
      });
    } catch (err: any) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
