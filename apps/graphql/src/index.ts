import "dotenv/config";
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { typeDefs, resolvers, createContext } from "@0xflick/graphql";

createContext().then((context) => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  });

  apolloServer.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
