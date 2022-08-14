import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "/api/graphql",
  // Localhost graphql is cross origin, so we need to send credentials
  ...(process.env.NODE_ENV === "development" ? { credentials: "include" } : {}),
  cache: new InMemoryCache(),
});
