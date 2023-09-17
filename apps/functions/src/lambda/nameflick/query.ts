import { utils } from "ethers";
import { createDb, fetchTableNames, NameFlickDAO } from "@0xflick/backend";
import {
  resolveCoinAddress,
  resolveContent,
  resolveFriendAvatar,
  resolveFriendCoinAddress,
  resolveTextRecord,
} from "./resolve.js";
import { DatabaseResult } from "./types.js";
import { ETH_COIN_TYPE } from "./config.js";

const ttl = 300;
const EMPTY_RESPONSE = { result: [""], ttl };
const EMPTY_HEX_RESPONSE = { result: ["0x"], ttl };

const promiseDao = (() => {
  const p = Promise.resolve().then(async () => {
    console.log(
      `Creating db... with ${process.env.SSM_PARAM_NAME} and ${process.env.SSM_REGION}`
    );
    const region = await fetchTableNames({
      region: process.env.SSM_REGION,
      paramName: process.env.SSM_PARAM_NAME,
    });
    console.log("region", region);
    const db = createDb({
      region,
    });
    return new NameFlickDAO(db);
  });

  return () => p;
})();

export const queryHandlers: Record<
  string,
  (name: string, args: utils.Result) => Promise<DatabaseResult>
> = {
  "addr(bytes32)": async (name) => {
    try {
      const nameflickDao = await promiseDao();
      if (name.endsWith(".frenzens.eth")) {
        const result = await resolveFriendCoinAddress(
          name,
          name.replace(".frenzens.eth", ""),
          nameflickDao
        );
        if (!result) {
          return EMPTY_RESPONSE;
        }
        return result;
      }
      const result = await resolveCoinAddress(
        name,
        ETH_COIN_TYPE,
        nameflickDao
      );
      if (!result) {
        return EMPTY_RESPONSE;
      }
      return result;
    } catch (err) {
      console.error(err);
      return EMPTY_RESPONSE;
    }
  },
  "addr(bytes32,uint256)": async (name, args) => {
    try {
      const nameflickDao = await promiseDao();
      if (args[0] === ETH_COIN_TYPE && name.endsWith(".frenzens.eth")) {
        const result = await resolveFriendCoinAddress(
          name,
          name.replace(".frenzens.eth", ""),
          nameflickDao
        );
        if (!result) {
          return EMPTY_RESPONSE;
        }
        return result;
      }
      const result = await resolveCoinAddress(name, args[0], nameflickDao);
      if (!result) {
        return EMPTY_RESPONSE;
      }
      return result;
    } catch (err) {
      console.error(err);
      return EMPTY_RESPONSE;
    }
  },
  "text(bytes32,string)": async (name, args) => {
    try {
      const nameflickDao = await promiseDao();
      if (name.endsWith(".frenzens.eth") && args[0] === "avatar") {
        const response = await resolveFriendAvatar(
          name,
          name.replace(".frenzens.eth", ""),
          nameflickDao
        );
        if (!response) {
          return EMPTY_RESPONSE;
        }
        return response;
      }
      const result = await resolveTextRecord(name, args[0], nameflickDao);
      if (!result) {
        return EMPTY_RESPONSE;
      }
      return result;
    } catch (err) {
      console.error(err);
      return EMPTY_RESPONSE;
    }
  },
  "contenthash(bytes32)": async (name) => {
    try {
      const nameflickDao = await promiseDao();
      const result = await resolveContent(name, nameflickDao);
      if (!result) {
        return EMPTY_HEX_RESPONSE;
      }
      return result;
    } catch (err) {
      console.error(err);
      return EMPTY_HEX_RESPONSE;
    }
  },
};
