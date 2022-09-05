import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ChainQuery = {
  __typename?: 'ChainQuery';
  chainId: Scalars['String'];
  chainName: Scalars['String'];
  ensRegistry?: Maybe<Scalars['String']>;
  flick?: Maybe<Flick>;
  image?: Maybe<Scalars['String']>;
};


export type ChainQueryImageArgs = {
  contract: Scalars['String'];
  height?: InputMaybe<Scalars['Int']>;
  tokenId: Scalars['Int'];
  width?: InputMaybe<Scalars['Int']>;
};

export type Flick = {
  __typename?: 'Flick';
  nfts?: Maybe<Array<Nft>>;
};

export type Metadata = {
  __typename?: 'Metadata';
  attributes?: Maybe<Array<MetadataAttribute>>;
  description?: Maybe<Scalars['String']>;
  edition?: Maybe<Scalars['String']>;
  externalUrl?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  image?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  properties?: Maybe<Array<MetadataProperties>>;
  tokenId: Scalars['String'];
};

export type MetadataAttribute = MetadataAttributeNumeric | MetadataAttributeString;

export type MetadataAttributeNumeric = {
  __typename?: 'MetadataAttributeNumeric';
  display_type?: Maybe<Scalars['String']>;
  trait_type?: Maybe<Scalars['String']>;
  value: Scalars['Float'];
};

export type MetadataAttributeString = {
  __typename?: 'MetadataAttributeString';
  colors?: Maybe<Array<Scalars['String']>>;
  trait_type: Scalars['String'];
  value: Scalars['String'];
};

export type MetadataProperties = {
  __typename?: 'MetadataProperties';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createOrUpdateNameflick: Nameflick;
  createRole: Role;
  deleteNameflick: Scalars['Boolean'];
  nonceForAddress?: Maybe<Nonce>;
  role: Role;
  roles: Array<Role>;
  self?: Maybe<Web3User>;
  signIn?: Maybe<Web3LoginUser>;
  signOut: Scalars['Boolean'];
};


export type MutationCreateOrUpdateNameflickArgs = {
  domain: Scalars['ID'];
  fields: NameflickFieldsInput;
  ttl?: InputMaybe<Scalars['Int']>;
};


export type MutationCreateRoleArgs = {
  name: Scalars['String'];
  permissions: Array<PermissionInput>;
};


export type MutationDeleteNameflickArgs = {
  domain: Scalars['ID'];
};


export type MutationNonceForAddressArgs = {
  address: Scalars['String'];
};


export type MutationRoleArgs = {
  id: Scalars['ID'];
};


export type MutationSignInArgs = {
  address: Scalars['String'];
  chainId: Scalars['Int'];
  issuedAt: Scalars['String'];
  jwe: Scalars['String'];
};

export type Nameflick = {
  __typename?: 'Nameflick';
  addresses: NameflickAddress;
  content?: Maybe<Scalars['String']>;
  domain: Scalars['ID'];
  ensHash?: Maybe<Scalars['String']>;
  etherscan: Scalars['String'];
  rootDomain: Scalars['String'];
  textRecord: NameflickTextRecord;
  ttl?: Maybe<Scalars['Int']>;
};

export type NameflickAddress = {
  __typename?: 'NameflickAddress';
  btc?: Maybe<Scalars['String']>;
  doge?: Maybe<Scalars['String']>;
  eth?: Maybe<Scalars['String']>;
  ltc?: Maybe<Scalars['String']>;
};

export type NameflickAddressInput = {
  btc?: InputMaybe<Scalars['String']>;
  doge?: InputMaybe<Scalars['String']>;
  eth?: InputMaybe<Scalars['String']>;
  ltc?: InputMaybe<Scalars['String']>;
};

export type NameflickFieldsInput = {
  addresses?: InputMaybe<NameflickAddressInput>;
  content?: InputMaybe<Scalars['String']>;
  textRecord?: InputMaybe<NameflickTextRecordInput>;
};

export type NameflickTextRecord = {
  __typename?: 'NameflickTextRecord';
  avatar?: Maybe<Scalars['String']>;
  comDiscord?: Maybe<Scalars['String']>;
  comGithub?: Maybe<Scalars['String']>;
  comReddit?: Maybe<Scalars['String']>;
  comTwitter?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  keywords?: Maybe<Scalars['String']>;
  notice?: Maybe<Scalars['String']>;
  orgTelegram?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type NameflickTextRecordInput = {
  avatar?: InputMaybe<Scalars['String']>;
  comDiscord?: InputMaybe<Scalars['String']>;
  comGithub?: InputMaybe<Scalars['String']>;
  comReddit?: InputMaybe<Scalars['String']>;
  comTwitter?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  keywords?: InputMaybe<Scalars['String']>;
  notice?: InputMaybe<Scalars['String']>;
  orgTelegram?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type Nft = {
  __typename?: 'Nft';
  collectionName: Scalars['String'];
  contractAddress: Scalars['String'];
  ownedTokens: Array<NftToken>;
};

export type NftToken = {
  __typename?: 'NftToken';
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  metadata?: Maybe<Metadata>;
  tokenId: Scalars['String'];
};


export type NftTokenImageArgs = {
  height?: InputMaybe<Scalars['Int']>;
  width?: InputMaybe<Scalars['Int']>;
};

export type Nonce = {
  __typename?: 'Nonce';
  nonce: Scalars['Int'];
};

export type Permission = {
  __typename?: 'Permission';
  action: PermissionAction;
  identifier?: Maybe<Scalars['String']>;
  resource: PermissionResource;
};

export enum PermissionAction {
  Admin = 'ADMIN',
  Create = 'CREATE',
  Delete = 'DELETE',
  Get = 'GET',
  List = 'LIST',
  Update = 'UPDATE',
  Use = 'USE'
}

export type PermissionInput = {
  action: PermissionAction;
  identifier?: InputMaybe<Scalars['String']>;
  resource: PermissionResource;
};

export enum PermissionResource {
  Admin = 'ADMIN',
  All = 'ALL',
  Faucet = 'FAUCET',
  Permission = 'PERMISSION',
  Presale = 'PRESALE',
  Role = 'ROLE',
  User = 'USER',
  UserRole = 'USER_ROLE'
}

export type Query = {
  __typename?: 'Query';
  chain: ChainQuery;
  nameflickByEnsHash?: Maybe<Nameflick>;
  nameflickByFqdn?: Maybe<Nameflick>;
  nameflicksByRootDomain: Array<Nameflick>;
  role: Role;
  roles: Array<Role>;
  self?: Maybe<Web3User>;
};


export type QueryChainArgs = {
  id: Scalars['ID'];
};


export type QueryNameflickByEnsHashArgs = {
  ensHash: Scalars['String'];
};


export type QueryNameflickByFqdnArgs = {
  fqdn: Scalars['ID'];
};


export type QueryNameflicksByRootDomainArgs = {
  rootDomain: Scalars['String'];
};


export type QueryRoleArgs = {
  id: Scalars['ID'];
};

export type Role = {
  __typename?: 'Role';
  bindToUser: Web3User;
  delete: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  permissions: Array<Permission>;
  unbindFromUser: Web3User;
  userCount: Scalars['Int'];
};


export type RoleBindToUserArgs = {
  userAddress: Scalars['String'];
};


export type RoleUnbindFromUserArgs = {
  userAddress: Scalars['String'];
};

export type Web3LoginUser = {
  __typename?: 'Web3LoginUser';
  address: Scalars['ID'];
  token: Scalars['String'];
  user: Web3User;
};

export type Web3User = {
  __typename?: 'Web3User';
  address: Scalars['ID'];
  allowedActions: Array<Permission>;
  bindToRole: Web3User;
  nonce: Scalars['Int'];
  roles: Array<Role>;
};


export type Web3UserBindToRoleArgs = {
  roleId: Scalars['String'];
};

export type CreateRoleMutationVariables = Exact<{
  roleName: Scalars['String'];
  permissions: Array<PermissionInput> | PermissionInput;
}>;


export type CreateRoleMutation = { __typename?: 'Mutation', createRole: { __typename?: 'Role', id: string } };

export type GetNonceMutationVariables = Exact<{
  address: Scalars['String'];
}>;


export type GetNonceMutation = { __typename?: 'Mutation', nonceForAddress?: { __typename?: 'Nonce', nonce: number } | null };

export type SignInMutationVariables = Exact<{
  address: Scalars['String'];
  jwe: Scalars['String'];
  chainId: Scalars['Int'];
  issuedAt: Scalars['String'];
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn?: { __typename?: 'Web3LoginUser', token: string } | null };


export const CreateRoleDocument = gql`
    mutation createRole($roleName: String!, $permissions: [PermissionInput!]!) {
  createRole(name: $roleName, permissions: $permissions) {
    id
  }
}
    `;
export const GetNonceDocument = gql`
    mutation getNonce($address: String!) {
  nonceForAddress(address: $address) {
    nonce
  }
}
    `;
export const SignInDocument = gql`
    mutation signIn($address: String!, $jwe: String!, $chainId: Int!, $issuedAt: String!) {
  signIn(address: $address, jwe: $jwe, chainId: $chainId, issuedAt: $issuedAt) {
    token
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    createRole(variables: CreateRoleMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateRoleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateRoleMutation>(CreateRoleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createRole', 'mutation');
    },
    getNonce(variables: GetNonceMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetNonceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNonceMutation>(GetNonceDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getNonce', 'mutation');
    },
    signIn(variables: SignInMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SignInMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SignInMutation>(SignInDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'signIn', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;