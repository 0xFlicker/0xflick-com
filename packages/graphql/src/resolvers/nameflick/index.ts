import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { TContext } from "../../context";
import { NameflickFieldsInput, Nameflick } from "../../types.generated";
import { createOrUpdateNameFlickRecord } from "../../controllers/nameflick/createOrUpdateRecord";
import { nameflickModelToGraphql } from "../../transforms/nameflick";
import { deleteNameflickRecordByFqdn } from "../../controllers/nameflick/deleteRecord";
import {
  fetchNameflickRecordsByRootDomain,
  fetchNameflickRecordByEnsHash,
  fetchNameflickRecordByFqdn,
} from "../../controllers/nameflick/fetchRecord";
import { Resolvers } from "../../resolvers.generated";

export const typeSchema = gql`
  type NameflickAddress {
    eth: String
    btc: String
    ltc: String
    doge: String
  }
  type NameflickTextRecord {
    email: String
    avatar: String
    description: String
    comDiscord: String
    comGithub: String
    url: String
    notice: String
    keywords: String
    comReddit: String
    comTwitter: String
    orgTelegram: String
  }
  type Nameflick {
    domain: ID!
    ensHash: String
    rootDomain: String!
    ttl: Int
    addresses: NameflickAddress!
    content: String
    textRecord: NameflickTextRecord!
    etherscan: String!
  }
  input NameflickAddressInput {
    eth: String
    btc: String
    ltc: String
    doge: String
  }
  input NameflickTextRecordInput {
    email: String
    avatar: String
    description: String
    comDiscord: String
    comGithub: String
    url: String
    notice: String
    keywords: String
    comReddit: String
    comTwitter: String
    orgTelegram: String
  }
  input NameflickFieldsInput {
    addresses: NameflickAddressInput
    content: String
    textRecord: NameflickTextRecordInput
  }
`;

const nameFlickByFqdnResolver: IFieldResolver<
  unknown,
  TContext,
  { fqdn: string }
> = async (source, { fqdn }, context) => {
  return await fetchNameflickRecordByFqdn(context, { fqdn });
};

const nameFlickByEnsHashResolver: IFieldResolver<
  unknown,
  TContext,
  { ensHash: string }
> = async (source, { ensHash }, context) => {
  return await fetchNameflickRecordByEnsHash(context, { ensHash });
};

const nameFlicksByRootDomainResolver: IFieldResolver<
  unknown,
  TContext,
  { rootDomain: string }
> = async (source, { rootDomain }, context) => {
  return await fetchNameflickRecordsByRootDomain(context, { rootDomain });
};

export const queryResolvers: Resolvers<TContext>["Query"] = {
  nameflickByFqdn: nameFlickByFqdnResolver,
  nameflickByEnsHash: nameFlickByEnsHashResolver,
  nameflicksByRootDomain: nameFlicksByRootDomainResolver,
};


const createOrUpdateNameflickResolver: IFieldResolver<
  unknown,
  TContext,
  { domain: string; fields: NameflickFieldsInput; ttl?: number },
  Promise<Nameflick>
> = async (_, { domain, ttl, fields }, context, info) => {
  const result = await createOrUpdateNameFlickRecord(
    context,
    info,
    domain,
    ttl ?? null,
    fields
  );
  return nameflickModelToGraphql(result);
};

const deleteNameflickResolver: IFieldResolver<
  unknown,
  TContext,
  { domain: string },
  Promise<boolean>
> = async (_, { domain }, context, info) => {
  await deleteNameflickRecordByFqdn(context, info, domain);
  return true;
};

export const mutationResolvers: Resolvers<TContext>["Mutation"] = {
  createOrUpdateNameflick: createOrUpdateNameflickResolver,
  deleteNameflick: deleteNameflickResolver,
};
