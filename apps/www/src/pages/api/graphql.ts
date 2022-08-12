import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";
import { typeDefs, resolvers, createContext } from "@0xflick/graphql";
import {
  deserializeSessionCookie,
  expireSessionCookie,
  serializeSessionCookie,
} from "@0xflick/backend";

function createHandler({ path }: { path: string }) {
  const startedServer = createContext().then(async (context) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context({ req, res }) {
        return {
          ...context,
          getToken: () => {
            return deserializeSessionCookie(req.headers.cookie);
          },
          setToken: (token: string) => {
            res.setHeader("set-cookie", serializeSessionCookie(token, path));
          },
          clearToken: () => {
            res.setHeader("set-cookie", expireSessionCookie("/api/"));
          },
        };
      },
      introspection: true,
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
    });
    await server.start();
    return server;
  });
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    const graphqlHandler = (await startedServer).createHandler({
      path,
    });
    await graphqlHandler(req, res);
  };
}

export default createHandler({
  path: "/api/graphql",
});

export const config = {
  api: {
    bodyParser: false,
  },
};
