import { gql } from "apollo-server-core";
import { TContext } from "../../context";
import { Resolvers } from "../../resolvers.generated";
import {
  mutationResolvers as mutationResolversRoles,
  queryResolvers as queryResolversRoles,
  typeSchema as typeSchemaRoles,
  resolvers as resolversRoles,
} from "./roles";

export const typeSchema = gql`
  ${typeSchemaRoles}
`;

export const mutationResolves: Resolvers<TContext>["Mutation"] = {
  ...mutationResolversRoles,
};

export const queryResolvers: Resolvers<TContext>["Query"] = {
  ...queryResolversRoles,
};

export const resolvers: Resolvers<TContext> = {
  ...resolversRoles,
};
