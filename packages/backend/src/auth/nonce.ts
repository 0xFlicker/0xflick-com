import { getDb } from "backend/db/dynamodb";
import { UserDAO } from "backend/db/user";
import { fetchTableNames } from "backend/helpers";
import { utils } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

interface IDataSuccess {
  nonce: number;
}
interface IDataError {
  error: string;
}
const promiseTableNames = fetchTableNames();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataSuccess | IDataError>
) {
  await promiseTableNames;
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const addressParam = req.query.address;
    if (!addressParam) {
      return res.status(400).json({ error: "Address is required" });
    }
    const address = Array.isArray(addressParam)
      ? addressParam[0]
      : addressParam;
    if (!utils.isAddress(address)) {
      return res.status(400).json({ error: "Address is invalid" });
    }
    // Some useful things
    const db = getDb();
    const userDao = new UserDAO(db);
    const user = await userDao.getUser(address);
    if (!user) {
      return res.status(200).json({
        nonce: 0,
      });
    }
    const nonce = user.nonce;
    return res.status(200).json({
      nonce,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
