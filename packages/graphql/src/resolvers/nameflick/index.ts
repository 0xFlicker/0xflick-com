import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { INameflick } from "@0xflick/models";
import { TContext } from "../../context";
import { NameflickFieldsInput, Nameflick } from "../../types.generated";
import { createOrUpdateNameFlickRecord } from "../../controllers/nameflick/createOrUpdateRecord";
import { nameflickModelToGraphql } from "./transforms";
import { deleteNameflickRecordByFqdn } from "../../controllers/nameflick/deleteRecord";
import {
  fetchNameflickRecordsByRootDomain,
  fetchNameflickRecordByEnsHash,
  fetchNameflickRecordByFqdn,
} from "../../controllers/nameflick/fetchRecord";

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

export const querySchema = `
  nameflickByFqdn(fqdn: ID!): Nameflick
  nameflickByEnsHash(ensHash: String!): Nameflick
  nameflicksByRootDomain(rootDomain: String!): [Nameflick!]!
`;

const nameFlickByFqdnResolver: IFieldResolver<
  void,
  TContext,
  { fqdn: string }
> = async (source, { fqdn }, context) => {
  return await fetchNameflickRecordByFqdn(context, { fqdn });
};

const nameFlickByEnsHashResolver: IFieldResolver<
  void,
  TContext,
  { ensHash: string }
> = async (source, { ensHash }, context) => {
  return await fetchNameflickRecordByEnsHash(context, { ensHash });
};

const nameFlicksByRootDomainResolver: IFieldResolver<
  void,
  TContext,
  { rootDomain: string }
> = async (source, { rootDomain }, context) => {
  return await fetchNameflickRecordsByRootDomain(context, { rootDomain });
};

export const queryResolvers = {
  nameflickByFqdn: nameFlickByFqdnResolver,
  nameflickByEnsHash: nameFlickByEnsHashResolver,
  nameflicksByRootDomain: nameFlicksByRootDomainResolver,
};

export const mutationSchema = `
  createOrUpdateNameflick(
    domain: ID!,
    ttl: Int,
    fields: NameflickFieldsInput!
  ): Nameflick!
  deleteNameflick(domain: ID!): Boolean!
`;

const createOrUpdateNameflickResolver: IFieldResolver<
  void,
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
  void,
  TContext,
  { domain: string },
  Promise<boolean>
> = async (_, { domain }, context, info) => {
  await deleteNameflickRecordByFqdn(context, info, domain);
  return true;
};

export const mutationResolvers = {
  createOrUpdateNameflick: createOrUpdateNameflickResolver,
  deleteNameflick: deleteNameflickResolver,
};

const nameflickEtherscanResolver: IFieldResolver<
  Nameflick,
  TContext,
  {},
  Promise<string>
> = async (source, _, context) => {
  return `https://etherscan.io/enslookup-search?search=${source.domain}`;
};

export const resolvers = {
  Nameflick: {
    etherscan: nameflickEtherscanResolver,
  },
};
