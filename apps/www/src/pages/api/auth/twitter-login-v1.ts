import { NextApiHandler } from "next";
import {
  getDb,
  AuthOrchestrationDao,
  fetchTableNames,
  getAppTwitterClient,
} from "@0xflick/backend";
import { EProviderTypes } from "@0xflick/models";

const db = getDb();
const authOrchestrationDao = new AuthOrchestrationDao(db);
const twitterApi = getAppTwitterClient();
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
    const protocol = process.env.WWW_PROTOCOL || "https";
    const callbackUrl = `${protocol}://${host}/api/auth/callback/twitter-v1`;
    console.log(`callbackUrl: ${callbackUrl}`);
    const { oauth_token, oauth_token_secret, url } =
      await twitterApi.generateAuthLink(callbackUrl, {
        authAccessType: "read",
        linkMode: "authorize",
      });

    await authOrchestrationDao.createState({
      state: oauth_token,
      codeVerifier: oauth_token_secret,
      provider: EProviderTypes["TWITTER-V1"],
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
