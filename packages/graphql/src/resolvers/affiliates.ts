import { gql } from "apollo-server-core";
import { generateSlug } from "random-word-slugs";
import { v4 as uuid } from "uuid";
import {
  defaultAdminStrategyAll,
  EActions,
  EResource,
  isActionOnResource,
} from "@0xflick/models";

import {
  AffiliateMutationResolvers,
  AffiliateQueryResolvers,
  MutationResolvers,
  QueryResolvers,
  Resolvers,
} from "../resolvers.generated";
import { TContext } from "../context";
import { AffiliateModel } from "../models";
import { AuthError } from "../errors/auth";
import { verifyAuthorizedUser } from "../controllers/auth/authorized";
import { AffiliatesError } from "../errors/affiliates";
import { AffiliateSlugAlreadyExistsError } from "@0xflick/backend";

export const typeSchema = gql`
  type Affiliate {
    address: String!
    slug: String!
    role: Role!
    deactivated: Boolean
  }

  type AffiliateQuery {
    address: ID!
    slugs: [String!]!
    role: Role!
  }

  type AffiliateMutation {
    address: ID!

    createSlug(slug: String!): AffiliateMutation!
    deactivate(slug: String!): Boolean!

    slugs: [String!]!
    role: Role!
  }
`;

const commonAffiliateResolvers:
  | AffiliateQueryResolvers<TContext>
  | AffiliateMutationResolvers<TContext> = {
  slugs: async (parent) => parent.slugs(),
  role: async (parent, _, context) =>
    parent.role(context.rolesDao, context.rolePermissionsDao),
};
export const resolvers: Resolvers<TContext> = {
  AffiliateQuery: {
    ...commonAffiliateResolvers,
  },
  AffiliateMutation: {
    ...commonAffiliateResolvers,
    createSlug: async (parent, { slug }, context) => {
      const { affiliateDao } = context;
      await verifyAuthorizedUser(context, canCreateAffiliate(slug));
      const { address } = parent;
      const roleId = await affiliateDao.getRoleForAffiliateAtAddress(address);
      if (!roleId) {
        throw new AffiliatesError(
          `No role found for affiliate at address ${address}`,
          "UNKNOWN_ROLE_ID"
        );
      }
      try {
        await affiliateDao.createAffiliate({
          address,
          slug: generateSlug(),
          roleId,
        });
      } catch (err) {
        if (err instanceof AffiliateSlugAlreadyExistsError) {
          throw new AffiliatesError(
            `Slug ${slug} already exists`,
            "UNABLE_TO_GENERATE_SLUG"
          );
        }
        throw err;
      }

      return parent;
    },
    // deactivate: async (parent, { slug }, context) => {
  },
};

const canReadOwnedAffiliate = (identifier?: string) =>
  defaultAdminStrategyAll(
    EResource.PERMISSION,
    isActionOnResource({
      action: EActions.GET,
      resource: EResource.AFFILIATE,
      identifier,
    })
  );

export const queryResolvers: QueryResolvers<TContext> = {
  affiliateForAddress: async (_, { address }, context, info) => {
    const user = await verifyAuthorizedUser(
      context,
      canReadOwnedAffiliate(address)
    );
    const { affiliateDao } = context;
    return new AffiliateModel(address, affiliateDao);
  },
};

const canCreateAffiliate = (identifier?: string) =>
  defaultAdminStrategyAll(
    EResource.PERMISSION,
    isActionOnResource({
      action: EActions.CREATE,
      resource: EResource.AFFILIATE,
      identifier,
    })
  );

export const mutationResolvers: MutationResolvers<TContext> = {
  affiliateForAddress: async (_, { address }, context) => {
    const user = await verifyAuthorizedUser(
      context,
      canReadOwnedAffiliate(address)
    );
    if (user.address !== address) {
      throw new AuthError("Forbidden", "NOT_AUTHORIZED");
    }
    const { affiliateDao } = context;
    return new AffiliateModel(address, affiliateDao);
  },
  createAffiliate: async (_, { address }, context) => {
    const user = await verifyAuthorizedUser(
      context,
      canCreateAffiliate(address)
    );
    const { affiliateDao, rolesDao, rolePermissionsDao } = context;
    // Check if affiliate exists
    let roleId = await affiliateDao.getRoleForAffiliateAtAddress(address);
    if (!roleId) {
      roleId = uuid();
      await Promise.all([
        rolesDao.create({
          id: roleId,
          name: `Affiliate ${address}`,
        }),
        rolePermissionsDao.bind({
          roleId,
          resource: EResource.AFFILIATE,
          action: EActions.ADMIN,
          identifier: address,
        }),
      ]);
    }
    return new AffiliateModel(address, affiliateDao);
  },
};
