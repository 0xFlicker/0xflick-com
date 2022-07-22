import {
  AccountProviderModel,
  IAccountProvider,
  TProviderTypes,
  AccountUserModel,
  IAccountUser,
  IVerificationRequest,
  VerificationRequestModel,
} from "@0xflick/models";

import { AuthOrchestrationDao } from "./orchestration";

export type TPK = string & { __pk: true };
export type TSK = string & { __sk: true };
export type GSI1PK = string & { __gsi1pk: true };
export type GSI1SK = string & { __gsi1sk: true };

export interface IPrimaryDB {
  pk: TPK;
  sk: TSK;
}

export interface IGlobalSecondaryIndex1DB extends IPrimaryDB {
  GSI1PK: GSI1PK;
  GSI1SK: GSI1SK;
}

export interface IStateDB extends IPrimaryDB {
  state: string;
  codeVerifier: string;
  provider: TProviderTypes;
  redirectUri: string;
}

const VERIFICATION_REQUEST_PREFIX = "VR#";
const USER_PREFIX = "USER#";
const ACCOUNT_PREFIX = "ACCOUNT#";

export function stateToPrimaryKey(state: string): TPK {
  return `${VERIFICATION_REQUEST_PREFIX}${state}` as TPK;
}

export function stateToSortKey(state: string): TSK {
  return `${VERIFICATION_REQUEST_PREFIX}${state}` as TSK;
}

export function stateToDBItem(verifier: IVerificationRequest): IStateDB {
  return {
    pk: stateToPrimaryKey(verifier.state),
    sk: stateToSortKey(verifier.state),
    state: verifier.state,
    codeVerifier: verifier.codeVerifier,
    provider: verifier.provider,
    redirectUri: verifier.redirectUri,
  };
}

export function stateDBItemToModel(
  item: Record<string, any>
): VerificationRequestModel {
  return new VerificationRequestModel({
    state: item.state,
    codeVerifier: item.codeVerifier,
    provider: item.provider,
    redirectUri: item.redirectUri,
  });
}

export interface IUserDB extends IPrimaryDB {
  address: string;
  follower: boolean;
}

export function userToPrimaryKey(address: string): TPK {
  return `${USER_PREFIX}${address}` as TPK;
}

export function userToSortKey(address: string): TSK {
  return `${USER_PREFIX}${address}` as TSK;
}

export function userToDBItem(user: IAccountUser): IUserDB {
  return {
    pk: userToPrimaryKey(user.address),
    sk: userToSortKey(user.address),
    address: user.address,
    follower: user.follower,
  };
}

export function userDBItemToModel(item: Record<string, any>): AccountUserModel {
  return new AccountUserModel({
    address: item.address,
    follower: item.follower,
  });
}

export interface IAccountDB extends IGlobalSecondaryIndex1DB {
  providerAccountId: string;
  provider: TProviderTypes;
  address: string;
  accessToken?: string;
  oauthV1AccessToken?: string;
  oauthV1Secret?: string;
  oauthV1Code?: string;
}

export function accountToSortKey(
  provider: TProviderTypes,
  providerAccountId: string
): TSK {
  return `${ACCOUNT_PREFIX}${provider}#${providerAccountId}` as TSK;
}

export function accountToGSI1PK(provider: TProviderTypes): GSI1PK {
  return `${ACCOUNT_PREFIX}${provider}` as GSI1PK;
}

export function accountToGSI1SK(providerAccountId: string): GSI1SK {
  return `${ACCOUNT_PREFIX}${providerAccountId}` as GSI1SK;
}

export function accountProviderToDBItem(
  accountProvider: IAccountProvider
): IAccountDB {
  return {
    pk: userToPrimaryKey(accountProvider.address),
    sk: accountToSortKey(
      accountProvider.provider,
      accountProvider.providerAccountId
    ),
    GSI1PK: accountToGSI1PK(accountProvider.provider),
    GSI1SK: accountToGSI1SK(accountProvider.providerAccountId),
    address: accountProvider.address,
    providerAccountId: accountProvider.providerAccountId,
    provider: accountProvider.provider,
    ...(accountProvider.accessToken
      ? { accessToken: accountProvider.accessToken }
      : {}),
    ...(accountProvider.oauthV1AccessToken
      ? { oauthV1AccessToken: accountProvider.oauthV1AccessToken }
      : {}),
    ...(accountProvider.oauthV1Secret
      ? { oauthV1Secret: accountProvider.oauthV1Secret }
      : {}),
    ...(accountProvider.oauthV1Code
      ? { oauthV1Code: accountProvider.oauthV1Code }
      : {}),
  };
}

export function accountProviderDBItemToModel(
  item: Record<string, any>
): IAccountProvider {
  return new AccountProviderModel({
    address: item.address,
    providerAccountId: item.providerAccountId,
    provider: item.provider,
    accessToken: item.accessToken,
    oauthV1AccessToken: item.oauthV1AccessToken,
    oauthV1Secret: item.oauthV1Secret,
    oauthV1Code: item.oauthV1Code,
  });
}

export function tableName() {
  return AuthOrchestrationDao.TABLE_NAME;
}
