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
import {
  AffiliateSlugAlreadyExistsError,
  createJwtToken,
} from "@0xflick/backend";
import { authorizedUser } from "../controllers/auth/user";
import { createRole } from "../controllers/admin/roles";
import { sendDiscordMessage } from "@0xflick/backend/src/discord/send";
import { APIEmbedField } from "discord-api-types/v10";

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
    EResource.AFFILIATE,
    isActionOnResource({
      action,
      resource: EResource.AFFILIATE,
      identifier,
    })
  );

async function notifyDiscord({
  context,
  affiliate,
}: {
  context: TContext;
  affiliate: string;
}) {
  const {
    config: {
      discord: {
        testChannelId: channelId,
        messageTopicArn: discordMessageTopicArn,
      },
    },
    sns,
    providerForChain,
  } = context;
  const provider = providerForChain(1);

  const [affiliateEnsName] = await Promise.all([
    affiliate ? provider.resolveName(affiliate) : Promise.resolve(null),
  ]);
  const affiliateName = affiliateEnsName
    ? `${affiliateEnsName} (${affiliate})`
    : affiliate;
  const content = ":tada:";
  const fields: APIEmbedField[] = [];
  if (affiliate) {
    fields.push({
      name: "affiliate",
      value: affiliateName,
    });
  }

  await sendDiscordMessage({
    channelId,
    message: {
      content,
      embeds: [
        {
          title: "Presale Approved",
          description: "A user has been approved for presale",
          fields,
        },
      ],
    },
    topicArn: discordMessageTopicArn,
    sns,
  });
}

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
    EResource.AFFILIATE,
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
    console.log(
      `Creating affiliate for ${address} and user address: ${user.address}`
    );
    // if it is the logged in user then we can create an affiliate for them
    if (user.address === address) {
      canCreate = true;
    } else if (await defaultAuthorizer(context, user, affiliateAdmin)) {
      canCreate = true;
    }
    if (!canCreate) {
      throw new AuthError("Forbidden", "NOT_AUTHORIZED");
    }
    const { affiliateDao, rolesDao, setToken, userRolesDao } = context;
    // Check if affiliate exists
    const rootAffiliate = await affiliateDao.getRootForAffiliateAddress(
      address
    );
    let roleId = rootAffiliate?.roleId;
    if (!roleId) {
      roleId = uuid();
      const [presaleRole, affiliateRole] = await Promise.all([
        // This is the presale role that will be applied to incoming presale users for this affiliate
        createRole(context, info, {
          name: "presale",
          permissions: [
            {
              resource: EResource.PRESALE,
              action: EActions.USE,
              identifier: address,
            },
          ],
          skipAuth: true,
        }),
        // This role grants the affiliate manage access to their own affiliate
        createRole(context, info, {
          name: `Manage affiliate ${address}`,
          permissions: [
            {
              resource: EResource.AFFILIATE,
              action: EActions.GET,
              identifier: address,
            },
            {
              resource: EResource.AFFILIATE,
              action: EActions.CREATE,
              identifier: address,
            },
            {
              resource: EResource.AFFILIATE,
              action: EActions.DELETE,
              identifier: address,
            },
          ],
          skipAuth: true,
        }),
      ]);
      let affiliateRoleId: string;
      [roleId, affiliateRoleId] = await Promise.all([
        presaleRole.id(),
        affiliateRole.id(),
      ]);
      const [token] = await Promise.all([
        createJwtToken({
          address,
          nonce: user.nonce,
          roleIds: user.roleIds.concat([affiliateRoleId]),
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
        notifyDiscord({
          affiliate: address,
          context,
        }),
      ]);

      setToken(token);
    }
    return new AffiliateModel(address, affiliateDao, roleId);
  },
};
