import { ApolloServer } from "apollo-server-lambda";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { typeDefs, resolvers, createContext } from "@0xflick/graphql";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: await createContext({
    ssmParamName: process.env.SSM_PARAM_NAME,
    ssmRegion: process.env.SSM_REGION,
  }),
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

export const handler = server.createHandler();
