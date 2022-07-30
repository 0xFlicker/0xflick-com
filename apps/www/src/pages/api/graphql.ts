import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";
import { typeDefs, resolvers, createContext } from "@0xflick/graphql";

function createHandler({ path }: { path: string }) {
  const startedServer = createContext().then(async (context) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context,
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
