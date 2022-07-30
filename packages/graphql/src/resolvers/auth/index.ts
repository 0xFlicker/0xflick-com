import { gql } from "apollo-server-core";
import {
  queries as queriesNonce,
  querySchema as querySchemaNonce,
  resolvers as resolversQuery,
  typeSchema as typeSchemaNonce,
} from "./nonce";

export const typeSchema = gql`
  ${typeSchemaNonce}
`;

export const querySchema = `
${querySchemaNonce}
`;

export const resolvers = {
  ...resolversQuery,
};

export const queries = {
  ...queriesNonce,
};
