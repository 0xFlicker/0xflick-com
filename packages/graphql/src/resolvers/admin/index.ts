import { gql } from "apollo-server-core";
import {
  mutationSchema as mutationSchemaRoles,
  mutationResolvers as mutationResolversRoles,
  queryResolvers as queryResolversRoles,
  querySchema as querySchemaRoles,
  typeSchema as typeSchemaRoles,
} from "./roles";

export const typeSchema = gql`
  ${typeSchemaRoles}
`;

export const querySchema = `
  ${querySchemaRoles}
`;

export const mutationSchema = `
  ${mutationSchemaRoles}
`;

export const mutationResolves = {
  ...mutationResolversRoles,
};

export const queryResolvers = {
  ...queryResolversRoles,
};
