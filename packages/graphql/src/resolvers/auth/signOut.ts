import { TContext } from "../../context";
import { Resolvers } from "../../resolvers.generated";

export const mutations: Resolvers<TContext>["Mutation"] = {
  signOut: async (_, __, { clearToken }) => {
    clearToken();
    return true;
  },
};
