import { gql } from "apollo-server-core";
import { generateSlug } from "random-word-slugs";
import { v4 as uuid } from "uuid";
import {
  allowAdminAll,
  allowAdminOnResource,
  defaultAdminStrategyAll,
  EActions,
  EResource,
  forIdentifier,
  isActionOnResource,
  oneOf,
  or,
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
import {
  defaultAuthorizer,
  verifyAuthorizedUser,
} from "../controllers/auth/authorized";
import { AffiliatesError } from "../errors/affiliates";
import { AffiliateSlugAlreadyExistsError } from "@0xflick/backend";
import { authorizedUser } from "../controllers/auth/user";
import { createRole } from "../controllers/admin/roles";

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

    createSlug(slug: String): AffiliateMutation!
    deactivate(slug: String!): AffiliateMutation!
    delete: Boolean!

    slugs: [String!]!
    role: Role!
  }
`;

const canDoOnOwnAffiliate = (action: EActions, identifier?: string) =>
  defaultAdminStrategyAll(
    EResource.PERMISSION,
    isActionOnResource({
      action,
      resource: EResource.AFFILIATE,
      identifier,
    })
  );

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
      await verifyAuthorizedUser(context, canCreateAffiliate(parent.address));
      const { address } = parent;
      const rootAffiliate = await affiliateDao.getRootForAffiliateAddress(
        address
      );
      if (!rootAffiliate) {
        throw new AffiliatesError(
          `No role found for affiliate at address ${address}`,
          "UNKNOWN_ROLE_ID"
        );
      }
      try {
        slug = slug ?? generateSlug();
        await affiliateDao.createAffiliate({
          address,
          slug,
          roleId: rootAffiliate.roleId,
        });
        parent.invalidateSlugs();
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
    deactivate: async (parent, { slug }, context) => {
      const { affiliateDao } = context;
      await verifyAuthorizedUser(
        context,
        canDoOnOwnAffiliate(EActions.DELETE, parent.address)
      );
      await affiliateDao.deactivateAffiliate(slug);
      parent.invalidateSlugs();
      return new AffiliateModel(parent.address, affiliateDao);
    },
    delete: async (parent, _, context) => {
      const { affiliateDao, userRolesDao, rolePermissionsDao, rolesDao } =
        context;
      await verifyAuthorizedUser(context, affiliateAdmin);
      await Promise.all([
        affiliateDao.deleteAffiliate(parent.address),
        rolesDao.deleteRole(userRolesDao, rolePermissionsDao, parent.roleId),
      ]);
      return true;
    },
  },
};

export const queryResolvers: QueryResolvers<TContext> = {
  affiliateForAddress: async (_, { address }, context, info) => {
    await verifyAuthorizedUser(
      context,
      canDoOnOwnAffiliate(EActions.GET, address)
    );
    const { affiliateDao } = context;
    return new AffiliateModel(address, affiliateDao);
  },
};

const canCreateAffiliate = (address?: string) =>
  defaultAdminStrategyAll(
    EResource.PERMISSION,
    forIdentifier(
      address,
      isActionOnResource({
        action: EActions.CREATE,
        resource: EResource.AFFILIATE,
      })
    )
  );

const affiliateAdmin = oneOf(
  or(allowAdminOnResource(EResource.AFFILIATE), allowAdminAll)
);
export const mutationResolvers: MutationResolvers<TContext> = {
  affiliateForAddress: async (_, { address }, context) => {
    await verifyAuthorizedUser(
      context,
      canDoOnOwnAffiliate(EActions.GET, address)
    );
    const { affiliateDao } = context;
    return new AffiliateModel(address, affiliateDao);
  },
  createAffiliate: async (_, { address }, context, info) => {
    const user = await authorizedUser(context);
    let canCreate = false;
    // if it is the logged in user then we can create an affiliate for them
    if (user.address === address) {
      canCreate = true;
    } else if (await defaultAuthorizer(context, user, affiliateAdmin)) {
      canCreate = true;
    }
    if (!canCreate) {
      throw new AuthError("Forbidden", "NOT_AUTHORIZED");
    }
    const { affiliateDao, rolesDao, rolePermissionsDao, userRolesDao } =
      context;
    // Check if affiliate exists
    const rootAffiliate = await affiliateDao.getRootForAffiliateAddress(
      address
    );
    let roleId = rootAffiliate?.roleId;
    if (!roleId) {
      roleId = uuid();
      await rolesDao.create({
        id: roleId,
        name: `Affiliate ${address}`,
      });
      await Promise.all([
        rolePermissionsDao.bind({
          roleId,
          resource: EResource.AFFILIATE,
          action: EActions.GET,
          identifier: address,
        }),
        rolePermissionsDao.bind({
          roleId,
          resource: EResource.AFFILIATE,
          action: EActions.DELETE,
          identifier: address,
        }),
        rolePermissionsDao.bind({
          roleId,
          resource: EResource.AFFILIATE,
          action: EActions.CREATE,
          identifier: address,
        }),
        userRolesDao.bind({
          address,
          roleId,
          rolesDao,
        }),
        affiliateDao.enrollAffiliate({
          address,
          roleId,
        }),
        await createRole(context, info, {
          name: "presale",
          permissions: [
            {
              resource: EResource.PRESALE,
              action: EActions.USE,
              identifier: address,
            },
          ],
        }),
      ]);
    }
    return new AffiliateModel(address, affiliateDao, roleId);
  },
};
