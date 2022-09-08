import { gql } from "apollo-server-core";
import { TContext } from "../context";
import { requestApproval } from "../controllers/presale/approve";
import { Resolvers } from "../resolvers.generated";

export const typeSchema = gql`
  type PresaleApprovalResponse {
    approved: Boolean!
    token: String!
  }
`;

export const mutationResolver: Resolvers<TContext>["Mutation"] = {
  requestPresaleApproval: async (_, { affiliate }, context, info) => {
    return await requestApproval(context, info, { affiliate });
  },
};
