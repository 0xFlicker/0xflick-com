import type { NextApiRequest, NextApiResponse } from "next";
import { jsonRpcProvider } from "../utils/provider";

import { NFT__factory } from "@0xflick/contracts";
import { BigNumber, utils, Wallet } from "ethers";
import { EActions, EResource } from "@0xflick/models/permissions";
import { isActionOnResource } from "../utils/allowedActions";
import { allOf, not } from "../utils/matcher";
import { RolePermissionsDAO } from "../db/rolePermissions";
import { getDb } from "../db/dynamodb";
import { verifyJwtToken } from "@0xflick/models/user";
import { fetchTableNames, getAuthorizationToken } from "../helpers";
import { RolesDAO } from "../db/roles";
import { UserRolesDAO } from "../db/userRoles";
import { createJwtToken } from "../db/token";
import { serializeSessionCookie } from "../utils/cookie";

interface IDataSuccess {
  approved: boolean;
  token: string;
}
interface IDataError {
  error: string;
}

const canPerformAction = allOf(
  not(
    isActionOnResource({
      action: EActions.USE,
      resource: EResource.PRESALE,
    })
  )
);

export function defaultChainId() {
  return process.env.NEXT_PUBLIC_CHAIN_ID || "1";
}

export function defaultProviderUrl(chainId: string): string {
  return JSON.parse(process.env.WEB_CONNECT_RPC_JSON || "{}")[chainId] || "";
}

if (!process.env.NFT_CONTRACT_ADDRESS) {
  throw new Error("NFT_CONTRACT_ADDRESS is not set");
}
const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;

const db = getDb();
const rolePermissionsDao = new RolePermissionsDAO(db);
const rolesDao = new RolesDAO(db);
const userRolesDao = new UserRolesDAO(db);
const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataSuccess | IDataError>
) {
  await promiseTableNames;
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const token = getAuthorizationToken(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await verifyJwtToken(token);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const permissions = await rolePermissionsDao.allowedActionsForRoleIds(
      user.roleIds
    );
    console.log(
      `Checking if user ${user.address} does not already have a presale permissions`
    );
    const isAuthorized = canPerformAction(permissions);
    if (!isAuthorized) {
      console.log(
        `Failed to authorize user ${
          user.address
        } to approve presale mint. Reason: ${canPerformAction.describe(
          permissions
        )}`
      );
      return res.status(403).json({ error: "Forbidden" });
    }
    console.log(`Sanity checking the contract to verify there is still a mint`);
    const provider = jsonRpcProvider(defaultProviderUrl(defaultChainId()));
    const contract = NFT__factory.connect(nftContractAddress, provider);
    const [maxSupplyBigNumber, totalSupplyNumber] = await Promise.all([
      contract.maxSupply(),
      contract.totalSupply(),
    ]);
    if (maxSupplyBigNumber.eq(totalSupplyNumber)) {
      return res.status(404).json({ error: "No more tokens available" });
    }
    console.log(`Fetching all presale roles`);
    const availableRoles = await rolesDao.getRoleByName("presale");
    if (!availableRoles || !availableRoles.length) {
      console.warn(`No presale roles found`);
      return res
        .status(500)
        .json({ error: "Uh oh.... Unable to find presale role." });
    }
    console.log(`Fetching all rolePermissions for presale roles`);
    const rolePermissions = (
      await Promise.all(
        availableRoles.map((role) =>
          rolePermissionsDao.getAllPermissions(role.id)
        )
      )
    ).map((rolePermissions, index) => ({
      role: availableRoles[index],
      permissions: rolePermissions,
    }));
    //Find the narrowest permissions for the user (i.e. the least number of permissions)
    console.log(`Finding the narrowest permissions for the user`);
    const narrowestRole = rolePermissions.reduce(
      (acc, curr) =>
        acc.permissions.length < curr.permissions.length ? acc : curr,
      rolePermissions[0]
    );
    console.log(`Apply role ${narrowestRole.role.id} to user ${user.address}`);
    await userRolesDao.bind({
      address: user.address,
      roleId: narrowestRole.role.id,
      rolesDao,
    });

    // Update the user's token
    const newToken = await createJwtToken({
      address: user.address,
      nonce: user.nonce,
      roleIds: [...user.roleIds, narrowestRole.role.id],
    });
    res
      .status(200)
      .setHeader("set-cookie", serializeSessionCookie(newToken, "/api/"));
    return res.json({ approved: true, token: newToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
