import { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "../../db/dynamodb";
import { AuthOrchestrationDao } from "../../db/auth/orchestration";
import {
  fetchTableNames,
  getAuthorizationToken,
  getTwitterClient,
} from "../../helpers";
import { verifyJwtToken } from "@0xflick/models/user";
import { EProviderTypes } from "@0xflick/models/auth/accountProvider";

const db = getDb();
const authOrchestrationDao = new AuthOrchestrationDao(db);
const promiseTableNames = fetchTableNames();
const twitterApi = getTwitterClient();

if (!process.env.TWITTER_FOLLOW_USER_ID) {
  throw new Error("TWITTER_FOLLOW_USER_ID is not set");
}
const followTwitterUserId = process.env.TWITTER_FOLLOW_USER_ID;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await promiseTableNames;
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const token = getAuthorizationToken(req);
    if (!token) {
      console.log("No token");
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      console.log("Verifying token");
      const user = await verifyJwtToken(token);
      if (!user) {
        console.error("unable to verify token");
        return res.status(401).json({ error: "Unauthorized" });
      }
      const codeParam = req.query.code;
      if (!codeParam) {
        return res.status(400).json({ error: "Code is required" });
      }
      const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;

      const stateParam = req.query.state;
      if (!stateParam) {
        return res.status(400).json({ error: "State is required" });
      }
      const state = Array.isArray(stateParam) ? stateParam[0] : stateParam;
      console.log(`Checking state: ${state}`);
      const verified = await authOrchestrationDao.verifyState(
        state,
        EProviderTypes.TWITTER
      );
      if (!verified) {
        return res.status(400).json({ error: "State is invalid" });
      }
      // Exchange the code for an access token
      console.log("Exchanging code for token");
      const twitterResult = await twitterApi.loginWithOAuth2({
        code,
        codeVerifier: verified.codeVerifier,
        redirectUri: `https://${req.headers.host}/api/auth/callback/twitter`,
      });
      if (!twitterResult) {
        return res
          .status(400)
          .json({ error: "Unable to exchange code for token" });
      }
      const { accessToken, client: loggedInClient } = twitterResult;
      // Get the user's profile
      console.log("Getting user's profile");
      const profile = await loggedInClient.v2.me();
      if (!profile) {
        return res.status(400).json({ error: "Unable to load user" });
      }
      // Check if this user has a different address connected to this account
      console.log("Checking if user has a different address connected");
      const existingAccount =
        await authOrchestrationDao.doesAccountForAddressExist(
          user.address,
          EProviderTypes.TWITTER,
          profile.data.id
        );
      if (existingAccount.alreadyConnectedWithDifferentAddress) {
        return res.status(400).json({
          error: `Account already exists and is connected to ${existingAccount.alreadyConnectedAddress}`,
        });
      }
      console.log("Creating account");
      let follower = profile.data.id === followTwitterUserId;
      if (!follower) {
        const isFollowerResponse = await loggedInClient.v2.following(
          followTwitterUserId
        );
      }
      await authOrchestrationDao.createAccountForAddress(
        {
          address: user.address,
          provider: EProviderTypes.TWITTER,
          providerAccountId: profile.data.id,
          accessToken,
        },
        follower
      );
      console.log("Successfully connected Twitter account");
      res.status(302).setHeader("Location", verified.redirectUri);
      return res.send("Redirecting...");
    } catch (err: any) {
      console.error(err);
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
