import "dotenv/config";
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { typeDefs, resolvers, createContext } from "@0xflick/graphql";
import {
  deserializeSessionCookie,
  expireSessionCookie,
  serializeSessionCookie,
} from "@0xflick/backend";

createContext().then((context) => {
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
          res.setHeader("set-cookie", serializeSessionCookie(token, "/api/"));
        },
        clearToken: () => {
          res.setHeader("set-cookie", expireSessionCookie("/api/"));
        },
      };
    },
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  });

  apolloServer.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
