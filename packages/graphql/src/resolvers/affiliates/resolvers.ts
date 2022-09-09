import {
  AffiliateMutation,
  MutationResolvers,
  QueryResolvers,
  Resolvers,
} from "../../resolvers.generated";
import { TContext } from "../../context";
import { AffiliateModel } from "../../models";
import { authorizedUser } from "../../controllers/auth/user";
import { AuthError } from "../../errors/auth";

export const resolvers: Resolvers<TContext> = {
  AffiliateQuery: {
    slugs: async (parent) => parent.slugs(),
    role: async (parent, _, context) =>
      parent.role(context.rolesDao, context.rolePermissionsDao),
  },
};

export const queryResolvers: QueryResolvers<TContext> = {
  affiliateForAddress: async (_, { address }, context, info) => {
    const { affiliateDao } = context;
    return new AffiliateModel(address, affiliateDao);
  },
};

export const mutationResolvers: MutationResolvers<TContext> = {
  affiliateForAddress: async (_, { address }, context, info) => {
    const user = await authorizedUser(context);
    if (user.address !== address) {
      throw new AuthError("Forbidden", "NOT_AUTHORIZED");
    }
    const { affiliateDao } = context;
    return new AffiliateModel(address, affiliateDao);
  },
};
