import "dotenv/config";
import path from "path";
import { spawnSync } from "child_process";
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { typeDefs, resolvers, createContext } from "@0xflick/graphql";
import {
  deserializeSessionCookie,
  expireSessionCookie,
  serializeSessionCookie,
  IDeployConfig,
} from "@0xflick/backend";

export function jsonFromSecret(file: string) {
  const { stdout, stderr } = spawnSync("sops", ["--decrypt", file], {
    cwd: path.join(__dirname, "../../../secrets"),
    encoding: "utf8",
  });
  if (stderr) {
    throw new Error(stderr);
  }
  return JSON.parse(stdout);
}

const config: IDeployConfig = jsonFromSecret("deploy-secrets.json");

createContext(config)
  .then((context) => {
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context({ req, res }) {
        return {
          ...context,
          getToken: () => {
            return deserializeSessionCookie(req.headers.cookie);
          },
          setToken: (token: string) => {
            res.setHeader("set-cookie", serializeSessionCookie(token, "/"));
          },
          clearToken: () => {
            res.setHeader("set-cookie", expireSessionCookie("/"));
          },
        };
      },
      introspection: true,
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    });

    apolloServer.listen().then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
