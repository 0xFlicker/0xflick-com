import type { NextApiRequest, NextApiResponse } from "next";
import { jsonRpcProvider } from "utils/provider";

import { factory as erc721Factory } from "contracts/ERC721";
import { BigNumber, utils, Wallet } from "ethers";
import { EActions, EResource } from "models/permissions";
import { isActionOnResource } from "utils/allowedActions";
import { oneOf } from "utils/matcher";
import { RolePermissionsDAO } from "backend/db/rolePermissions";
import { getDb } from "backend/db/dynamodb";
import { verifyJwtToken } from "models/user";
import { fetchTableNames, getAuthorizationToken } from "backend/helpers";

interface IDataSuccess {
  signature: string;
  nonce: number;
}
interface IDataError {
  error: string;
}

const canPerformAction = oneOf(
  isActionOnResource({
    action: EActions.USE,
    resource: EResource.PRESALE,
  })
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
const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataSuccess | IDataError>
) {
  await promiseTableNames;
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
  }
  const addressParam = req.query.address;
  if (!addressParam) {
    res.status(400).json({ error: "Address is required" });
  }
  const address = Array.isArray(addressParam) ? addressParam[0] : addressParam;
  if (!utils.isAddress(address)) {
    res.status(400).json({ error: "Address is invalid" });
  }
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

  const isAuthorized =
    user.address === address && canPerformAction(permissions);
  if (!isAuthorized) {
    console.log(
      `Failed to authorize user ${
        user.address
      } to presale mint. Reason: ${canPerformAction.describe(permissions)}`
    );
    return res.status(403).json({ error: "Forbidden" });
  }

  const provider = jsonRpcProvider(defaultProviderUrl(defaultChainId()));
  const contract = erc721Factory(provider, nftContractAddress);
  const signer = new Wallet(process.env.SIGNER_PRIVATE_KEY || "");
  const [preSaleMaxMintPerAccountBigNumber, preSaleMintedBigNumber] =
    await Promise.all([
      contract.preSaleMaxMintPerAccount(),
      contract.presaleMintedByAddress(address),
    ]);
  const preSaleMaxMintPerAccount = BigNumber.from(
    preSaleMaxMintPerAccountBigNumber
  ).toNumber();
  if (preSaleMaxMintPerAccountBigNumber.sub(preSaleMintedBigNumber).lt(0)) {
    res.status(404).json({ error: "Mint limit exceeded" });
  }

  for (let i = 0; i < preSaleMaxMintPerAccount * 2; i++) {
    const nonceBytes = utils.hexZeroPad(utils.hexlify(i), 32);
    if (await contract.alreadyMinted(address, nonceBytes)) {
      continue;
    }
    const signature = await signer.signMessage(
      utils.arrayify(
        utils.solidityPack(
          ["address", "bytes32"],
          [address, utils.hexZeroPad(utils.hexlify(i), 32)]
        )
      )
    );
    return res.status(200).json({ signature, nonce: i });
  }
  return res.status(404).json({ error: "No more tokens available" });
}
