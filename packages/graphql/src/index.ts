// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
// import { ApolloServer } from "apollo-server-micro";
// import { NextApiRequest, NextApiResponse } from "next";
export { typeDefs, resolvers } from "./resolvers";

// export function createHandler({ path }: { path: string }) {
//   const apolloServer = new ApolloServer({
//     typeDefs,
//     resolvers,
//     introspection: true,
//     plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
//   });

//   const startServer = apolloServer.start();

//   return async function handler(req: NextApiRequest, res: NextApiResponse) {
//     await startServer;
//     const graphqlHandler = apolloServer.createHandler({
//       path,
//     });
//     await graphqlHandler(req, res);
//   };
// }
