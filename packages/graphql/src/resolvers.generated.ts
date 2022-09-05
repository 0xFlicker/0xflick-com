import { GraphQLResolveInfo } from 'graphql';
import { IUser } from '@0xflick/models';
import { TRole, TPermission } from './models';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
  requestPresaleApproval: Scalars['Boolean'];
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


export type MutationRequestPresaleApprovalArgs = {
  affiliate?: InputMaybe<Scalars['String']>;
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
  isTwitterFollower: Scalars['Boolean'];
  nonce: Scalars['Int'];
  roles: Array<Role>;
};


export type Web3UserBindToRoleArgs = {
  roleId: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ChainQuery: ResolverTypeWrapper<ChainQuery>;
  Flick: ResolverTypeWrapper<Flick>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Metadata: ResolverTypeWrapper<Omit<Metadata, 'attributes'> & { attributes?: Maybe<Array<ResolversTypes['MetadataAttribute']>> }>;
  MetadataAttribute: ResolversTypes['MetadataAttributeNumeric'] | ResolversTypes['MetadataAttributeString'];
  MetadataAttributeNumeric: ResolverTypeWrapper<MetadataAttributeNumeric>;
  MetadataAttributeString: ResolverTypeWrapper<MetadataAttributeString>;
  MetadataProperties: ResolverTypeWrapper<MetadataProperties>;
  Mutation: ResolverTypeWrapper<{}>;
  Nameflick: ResolverTypeWrapper<Nameflick>;
  NameflickAddress: ResolverTypeWrapper<NameflickAddress>;
  NameflickAddressInput: NameflickAddressInput;
  NameflickFieldsInput: NameflickFieldsInput;
  NameflickTextRecord: ResolverTypeWrapper<NameflickTextRecord>;
  NameflickTextRecordInput: NameflickTextRecordInput;
  Nft: ResolverTypeWrapper<Nft>;
  NftToken: ResolverTypeWrapper<NftToken>;
  Nonce: ResolverTypeWrapper<Nonce>;
  Permission: ResolverTypeWrapper<TPermission>;
  PermissionAction: PermissionAction;
  PermissionInput: PermissionInput;
  PermissionResource: PermissionResource;
  Query: ResolverTypeWrapper<{}>;
  Role: ResolverTypeWrapper<TRole>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Web3LoginUser: ResolverTypeWrapper<Omit<Web3LoginUser, 'user'> & { user: ResolversTypes['Web3User'] }>;
  Web3User: ResolverTypeWrapper<IUser>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  ChainQuery: ChainQuery;
  Flick: Flick;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Metadata: Omit<Metadata, 'attributes'> & { attributes?: Maybe<Array<ResolversParentTypes['MetadataAttribute']>> };
  MetadataAttribute: ResolversParentTypes['MetadataAttributeNumeric'] | ResolversParentTypes['MetadataAttributeString'];
  MetadataAttributeNumeric: MetadataAttributeNumeric;
  MetadataAttributeString: MetadataAttributeString;
  MetadataProperties: MetadataProperties;
  Mutation: {};
  Nameflick: Nameflick;
  NameflickAddress: NameflickAddress;
  NameflickAddressInput: NameflickAddressInput;
  NameflickFieldsInput: NameflickFieldsInput;
  NameflickTextRecord: NameflickTextRecord;
  NameflickTextRecordInput: NameflickTextRecordInput;
  Nft: Nft;
  NftToken: NftToken;
  Nonce: Nonce;
  Permission: TPermission;
  PermissionInput: PermissionInput;
  Query: {};
  Role: TRole;
  String: Scalars['String'];
  Web3LoginUser: Omit<Web3LoginUser, 'user'> & { user: ResolversParentTypes['Web3User'] };
  Web3User: IUser;
};

export type ChainQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ChainQuery'] = ResolversParentTypes['ChainQuery']> = {
  chainId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  chainName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ensRegistry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  flick?: Resolver<Maybe<ResolversTypes['Flick']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<ChainQueryImageArgs, 'contract' | 'tokenId'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FlickResolvers<ContextType = any, ParentType extends ResolversParentTypes['Flick'] = ResolversParentTypes['Flick']> = {
  nfts?: Resolver<Maybe<Array<ResolversTypes['Nft']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetadataResolvers<ContextType = any, ParentType extends ResolversParentTypes['Metadata'] = ResolversParentTypes['Metadata']> = {
  attributes?: Resolver<Maybe<Array<ResolversTypes['MetadataAttribute']>>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  edition?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  externalUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  properties?: Resolver<Maybe<Array<ResolversTypes['MetadataProperties']>>, ParentType, ContextType>;
  tokenId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetadataAttributeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MetadataAttribute'] = ResolversParentTypes['MetadataAttribute']> = {
  __resolveType: TypeResolveFn<'MetadataAttributeNumeric' | 'MetadataAttributeString', ParentType, ContextType>;
};

export type MetadataAttributeNumericResolvers<ContextType = any, ParentType extends ResolversParentTypes['MetadataAttributeNumeric'] = ResolversParentTypes['MetadataAttributeNumeric']> = {
  display_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  trait_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetadataAttributeStringResolvers<ContextType = any, ParentType extends ResolversParentTypes['MetadataAttributeString'] = ResolversParentTypes['MetadataAttributeString']> = {
  colors?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  trait_type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetadataPropertiesResolvers<ContextType = any, ParentType extends ResolversParentTypes['MetadataProperties'] = ResolversParentTypes['MetadataProperties']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createOrUpdateNameflick?: Resolver<ResolversTypes['Nameflick'], ParentType, ContextType, RequireFields<MutationCreateOrUpdateNameflickArgs, 'domain' | 'fields'>>;
  createRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationCreateRoleArgs, 'name' | 'permissions'>>;
  deleteNameflick?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteNameflickArgs, 'domain'>>;
  nonceForAddress?: Resolver<Maybe<ResolversTypes['Nonce']>, ParentType, ContextType, RequireFields<MutationNonceForAddressArgs, 'address'>>;
  requestPresaleApproval?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, Partial<MutationRequestPresaleApprovalArgs>>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationRoleArgs, 'id'>>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  self?: Resolver<Maybe<ResolversTypes['Web3User']>, ParentType, ContextType>;
  signIn?: Resolver<Maybe<ResolversTypes['Web3LoginUser']>, ParentType, ContextType, RequireFields<MutationSignInArgs, 'address' | 'chainId' | 'issuedAt' | 'jwe'>>;
  signOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type NameflickResolvers<ContextType = any, ParentType extends ResolversParentTypes['Nameflick'] = ResolversParentTypes['Nameflick']> = {
  addresses?: Resolver<ResolversTypes['NameflickAddress'], ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  domain?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ensHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  etherscan?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rootDomain?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  textRecord?: Resolver<ResolversTypes['NameflickTextRecord'], ParentType, ContextType>;
  ttl?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NameflickAddressResolvers<ContextType = any, ParentType extends ResolversParentTypes['NameflickAddress'] = ResolversParentTypes['NameflickAddress']> = {
  btc?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  doge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  eth?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ltc?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NameflickTextRecordResolvers<ContextType = any, ParentType extends ResolversParentTypes['NameflickTextRecord'] = ResolversParentTypes['NameflickTextRecord']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comDiscord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comGithub?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comReddit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comTwitter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keywords?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orgTelegram?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NftResolvers<ContextType = any, ParentType extends ResolversParentTypes['Nft'] = ResolversParentTypes['Nft']> = {
  collectionName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contractAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ownedTokens?: Resolver<Array<ResolversTypes['NftToken']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NftTokenResolvers<ContextType = any, ParentType extends ResolversParentTypes['NftToken'] = ResolversParentTypes['NftToken']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<NftTokenImageArgs>>;
  metadata?: Resolver<Maybe<ResolversTypes['Metadata']>, ParentType, ContextType>;
  tokenId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NonceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Nonce'] = ResolversParentTypes['Nonce']> = {
  nonce?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PermissionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Permission'] = ResolversParentTypes['Permission']> = {
  action?: Resolver<ResolversTypes['PermissionAction'], ParentType, ContextType>;
  identifier?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['PermissionResource'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  chain?: Resolver<ResolversTypes['ChainQuery'], ParentType, ContextType, RequireFields<QueryChainArgs, 'id'>>;
  nameflickByEnsHash?: Resolver<Maybe<ResolversTypes['Nameflick']>, ParentType, ContextType, RequireFields<QueryNameflickByEnsHashArgs, 'ensHash'>>;
  nameflickByFqdn?: Resolver<Maybe<ResolversTypes['Nameflick']>, ParentType, ContextType, RequireFields<QueryNameflickByFqdnArgs, 'fqdn'>>;
  nameflicksByRootDomain?: Resolver<Array<ResolversTypes['Nameflick']>, ParentType, ContextType, RequireFields<QueryNameflicksByRootDomainArgs, 'rootDomain'>>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<QueryRoleArgs, 'id'>>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  self?: Resolver<Maybe<ResolversTypes['Web3User']>, ParentType, ContextType>;
};

export type RoleResolvers<ContextType = any, ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']> = {
  bindToUser?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType, RequireFields<RoleBindToUserArgs, 'userAddress'>>;
  delete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['Permission']>, ParentType, ContextType>;
  unbindFromUser?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType, RequireFields<RoleUnbindFromUserArgs, 'userAddress'>>;
  userCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Web3LoginUserResolvers<ContextType = any, ParentType extends ResolversParentTypes['Web3LoginUser'] = ResolversParentTypes['Web3LoginUser']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Web3UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['Web3User'] = ResolversParentTypes['Web3User']> = {
  address?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  allowedActions?: Resolver<Array<ResolversTypes['Permission']>, ParentType, ContextType>;
  bindToRole?: Resolver<ResolversTypes['Web3User'], ParentType, ContextType, RequireFields<Web3UserBindToRoleArgs, 'roleId'>>;
  isTwitterFollower?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  nonce?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  ChainQuery?: ChainQueryResolvers<ContextType>;
  Flick?: FlickResolvers<ContextType>;
  Metadata?: MetadataResolvers<ContextType>;
  MetadataAttribute?: MetadataAttributeResolvers<ContextType>;
  MetadataAttributeNumeric?: MetadataAttributeNumericResolvers<ContextType>;
  MetadataAttributeString?: MetadataAttributeStringResolvers<ContextType>;
  MetadataProperties?: MetadataPropertiesResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Nameflick?: NameflickResolvers<ContextType>;
  NameflickAddress?: NameflickAddressResolvers<ContextType>;
  NameflickTextRecord?: NameflickTextRecordResolvers<ContextType>;
  Nft?: NftResolvers<ContextType>;
  NftToken?: NftTokenResolvers<ContextType>;
  Nonce?: NonceResolvers<ContextType>;
  Permission?: PermissionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  Web3LoginUser?: Web3LoginUserResolvers<ContextType>;
  Web3User?: Web3UserResolvers<ContextType>;
};

