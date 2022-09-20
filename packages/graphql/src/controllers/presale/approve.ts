import { GraphQLResolveInfo } from "graphql";
import {
  allOf,
  EActions,
  EResource,
  isActionOnResource,
  not,
  UserWithRolesModel,
} from "@0xflick/models";
import { sendDiscordMessage } from "@0xflick/backend/src/discord/send";
import { createJwtToken, createLogger, defaultChainId } from "@0xflick/backend";
import { TContext } from "../../context";
import { verifyAuthorizedUser } from "../auth/authorized";
import { PresaleError } from "../../errors/presale";
import { isTwitterFollowing } from "../twitter/isFollowing";
import { providers, utils } from "ethers";
import { SNS } from "@aws-sdk/client-sns";
import { APIEmbedField } from "discord-api-types/v10";

const logger = createLogger({
  name: "graphql/resolvers/presale/approve",
});

const canPerformAction = allOf(
  not(
    isActionOnResource({
      action: EActions.USE,
      resource: EResource.PRESALE,
    })
  )
);

async function notifyDiscord({
  address,
  affiliate,
  channelId,
  provider,
  discordMessageTopicArn,
  sns,
}: {
  affiliate: string;
  channelId: string;
  address: string;
  provider: providers.Provider;
  discordMessageTopicArn: string;
  sns: SNS;
}) {
  const [ensName, affiliateEnsName] = await Promise.all([
    provider.resolveName(address),
    affiliate ? provider.resolveName(affiliate) : Promise.resolve(null),
  ]);
  const displayName = !utils.isAddress(ensName)
    ? `${ensName} (${address})`
    : address;
  const affiliateName = !utils.isAddress(affiliateEnsName)
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
  fields.push({
    name: "new address",
    value: displayName,
  });

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

export async function requestApproval(
  context: TContext,
  info: GraphQLResolveInfo,
  {
    affiliate,
  }: {
    affiliate?: string;
  }
) {
  context.requireMutation(info);
  let user: UserWithRolesModel;
  try {
    user = await verifyAuthorizedUser(context, canPerformAction);
  } catch (e) {
    throw new PresaleError(
      "User already has presale access",
      "USER_ALL_READY_APPROVED",
      affiliate
    );
  }
  const isFollowing = await isTwitterFollowing(context, user);
  if (!isFollowing) {
    throw new PresaleError(`User is not following `, "NOT_TWITTER_FOLLOWING");
  }
  const {
    sns,
    rolesDao,
    rolePermissionsDao,
    userRolesDao,
    setToken,
    config: {
      discord: { testChannelId, messageTopicArn },
    },
  } = context;
  const availableRoles = await rolesDao.getRoleByName("presale");
  if (!availableRoles || !availableRoles.length) {
    logger.warn(`No presale roles found`);
    throw new PresaleError(
      "No presale roles found",
      "NO_PRESALE_ROLE_FOUND",
      affiliate
    );
  }
  const rolePermissions = (
    await Promise.all(
      availableRoles.map((role) =>
        rolePermissionsDao.getAllPermissions(role.id)
      )
    )
  ).map((rolePermissions, index) => ({
    role: availableRoles[index],
    permissions: rolePermissions,
  }));
  let roleId: string;

  const exactMatchRole = rolePermissions.find((rp) =>
    rp.permissions.some((p) => p.identifier === affiliate)
  );
  if (exactMatchRole) {
    roleId = exactMatchRole.role.id;
  } else {
    const narrowestRole = rolePermissions.reduce(
      (acc, curr) =>
        acc.permissions.length < curr.permissions.length ? acc : curr,
      rolePermissions[0]
    );
    if (narrowestRole) {
      roleId = narrowestRole.role.id;
    } else {
      logger.warn(`No presale roles found`);
      throw new PresaleError(
        "No presale roles found",
        "NO_PRESALE_ROLE_FOUND",
        affiliate
      );
    }
  }
  logger.info(`Apply role ${roleId} to user ${user.address}`);
  await userRolesDao.bind({
    address: user.address,
    roleId,
    rolesDao,
  });

  await notifyDiscord({
    affiliate,
    channelId: testChannelId,
    address: user.address,
    provider: context.providerForChain(Number(defaultChainId())),
    discordMessageTopicArn: messageTopicArn,
    sns,
  });

  const newToken = await createJwtToken({
    address: user.address,
    nonce: user.nonce,
    roleIds: [...user.roleIds, roleId],
  });
  setToken(newToken);
  return {
    approved: true,
    token: newToken,
  };
}
