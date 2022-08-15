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
  bindRoleToUser: Scalars['Boolean'];
  createRole: Role;
  nonceForAddress?: Maybe<Nonce>;
  role: Role;
  self?: Maybe<Web3User>;
  signIn?: Maybe<Web3LoginUser>;
  signOut: Scalars['Boolean'];
};


export type MutationBindRoleToUserArgs = {
  roleId: Scalars['ID'];
  userAddress: Scalars['ID'];
};


export type MutationCreateRoleArgs = {
  name: Scalars['String'];
  permissions: Array<PermissionInput>;
};


export type MutationNonceForAddressArgs = {
  address: Scalars['String'];
};


export type MutationRoleArgs = {
  id: Scalars['ID'];
};


export type MutationSignInArgs = {
  address: Scalars['String'];
  jwe: Scalars['String'];
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
  role: Role;
  self?: Maybe<Web3User>;
};


export type QueryChainArgs = {
  id: Scalars['ID'];
};


export type QueryRoleArgs = {
  id: Scalars['ID'];
};

export type Role = {
  __typename?: 'Role';
  bindToUser: Web3User;
  id: Scalars['ID'];
  name: Scalars['String'];
  permissions: Array<Permission>;
};


export type RoleBindToUserArgs = {
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
