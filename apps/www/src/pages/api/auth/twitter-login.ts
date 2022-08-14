import { NextApiHandler } from "next";
import {
  getDb,
  AuthOrchestrationDao,
  fetchTableNames,
  getTwitterClient,
} from "@0xflick/backend";
import { EProviderTypes } from "@0xflick/models";

const db = getDb();
const authOrchestrationDao = new AuthOrchestrationDao(db);
const twitterApi = getTwitterClient();
const promiseTableNames = fetchTableNames();
const handler: NextApiHandler = async (req, res) => {
  await promiseTableNames;
  try {
    const redirectUriParam = req.query.redirectUri;
    if (!redirectUriParam) {
      return res.status(400).json({ error: "redirectUri is required" });
    }
    const redirectUri = Array.isArray(redirectUriParam)
      ? redirectUriParam[0]
      : redirectUriParam;

    const host = req.headers.host;
    const callbackUrl = `https://${host}/api/auth/callback/twitter`;
    console.log(`callbackUrl: ${callbackUrl}`);
    const { url, codeVerifier, state } = twitterApi.generateOAuth2AuthLink(
      callbackUrl,
      { scope: ["follows.write", "users.read", "tweet.read"] }
    );
    await authOrchestrationDao.createState({
      state,
      codeVerifier,
      provider: EProviderTypes.TWITTER,
      redirectUri,
    });
    console.log(`redirecting to: ${url}`);
    // redirect to the Twitter auth link
    res.status(302).setHeader("Location", url);
    return res.send("Redirecting...");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export default handler;
