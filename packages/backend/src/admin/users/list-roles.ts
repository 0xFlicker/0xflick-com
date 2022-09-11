import { getDb } from "../../db/dynamodb";
import { RolePermissionsDAO } from "../../db/rolePermissions";
import { UserRolesDAO } from "../../db/userRoles";
import { fetchTableNames, getAuthorizationToken } from "../../helpers";
import {
  EActions,
  EResource,
  defaultAdminStrategyAll,
  forSelf,
  isActionOnResource,
  verifyJwtToken,
  IUserRolesListRolesResponse,
  IRole,
} from "@0xflick/models";
import type { NextApiRequest, NextApiResponse } from "next";
import { RolesDAO } from "../../db/roles";
import { IPaginationOptions } from "../../types";

interface IDataError {
  error: string;
}

const db = getDb();
const rolesDao = new RolesDAO(db);
const userRolesDao = new UserRolesDAO(db);
const rolePermissionsDao = new RolePermissionsDAO(db);
const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IUserRolesListRolesResponse | IDataError>
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
      if (!body.address) {
        return res.status(400).json({ error: "Missing address" });
      }
      // Check if user has the required roles
      const canPerformAction = defaultAdminStrategyAll(
        EResource.USER_ROLE,
        isActionOnResource({
          action: EActions.CREATE,
          resource: EResource.USER_ROLE,
        }),
        forSelf(body.address, user.address, EActions.GET, EResource.USER_ROLE)
      );

      const permissions = await rolePermissionsDao.allowedActionsForRoleIds(
        user.roleIds
      );
      const isAuthorized = canPerformAction(permissions);
      if (!isAuthorized) {
        console.log(
          `Failed to authorize user ${user.address} to add list roles for ${
            body.address
          }. Reason: ${canPerformAction.describe(permissions)}`
        );
        return res.status(403).json({ error: "Forbidden" });
      }

      // Fetch role from DB
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

      try {
        const roleResponse = await userRolesDao.getRoleIdsPaginated(
          body.address
        );
        try {
          let items = await Promise.all(
            roleResponse.items.map((roleId) => rolesDao.get(roleId))
          );
          if (items.some((item) => !!item)) {
            console.log(`Unable to fetch roles for user ${body.address}`);
            items = items.filter((item) => !!item);
          }
          return res.status(200).json({
            items: items as IRole[],
            count: roleResponse.count,
            page: roleResponse.page,
            ...(roleResponse.cursor && { cursor: roleResponse.cursor }),
          });
        } catch (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Internal server error fetching roles" });
        }
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Internal server error fetching user roles" });
      }
    } catch (err: any) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
