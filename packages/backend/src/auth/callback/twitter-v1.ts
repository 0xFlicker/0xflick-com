import { NextApiRequest, NextApiResponse } from "next";
import { TwitterApi } from "twitter-api-v2";
import { getDb } from "backend/db/dynamodb";
import { AuthOrchestrationDao } from "backend/db/auth/orchestration";
import {
  fetchTableNames,
  getAppTwitterClient,
  getAuthorizationToken,
} from "backend/helpers";
import { verifyJwtToken } from "models/user";
import { EProviderTypes } from "models/auth/accountProvider";

const db = getDb();
const authOrchestrationDao = new AuthOrchestrationDao(db);
const promiseTableNames = fetchTableNames();

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
      const codeParam = req.query.oauth_verifier;
      if (!codeParam) {
        return res.status(400).json({ error: "Code is required" });
      }
      const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;

      const stateParam = req.query.oauth_token;
      if (!stateParam) {
        return res.status(400).json({ error: "State is required" });
      }
      const state = Array.isArray(stateParam) ? stateParam[0] : stateParam;
      console.log(`Checking state: ${state}`);
      const verified = await authOrchestrationDao.verifyState(
        state,
        EProviderTypes["TWITTER-V1"]
      );
      if (!verified) {
        return res.status(400).json({ error: "State is invalid" });
      }
      // Save the token to the database

      // Exchange the code for an access token
      console.log("Exchanging code for token");
      const twitterApi = getAppTwitterClient({
        accessToken: state,
        accessSecret: verified.codeVerifier,
      });
      const twitterResult = await twitterApi.login(code);
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
          EProviderTypes["TWITTER-V1"],
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
        console.log(
          `Checking if ${profile.data.username} is following ${followTwitterUserId}`
        );
        const isFollowerResponse = await loggedInClient.v1.friendship({
          source_id: profile.data.id,
          target_id: followTwitterUserId,
        });
        follower = isFollowerResponse.relationship.source.following;
        console.log(
          `${profile.data.username} is ${
            follower ? "" : "not"
          } following ${followTwitterUserId}`
        );
      }
      await authOrchestrationDao.createAccountForAddress(
        {
          address: user.address,
          provider: EProviderTypes["TWITTER-V1"],
          providerAccountId: profile.data.id,
          oauthV1AccessToken: accessToken,
          oauthV1Secret: verified.codeVerifier,
          oauthV1Code: code,
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
