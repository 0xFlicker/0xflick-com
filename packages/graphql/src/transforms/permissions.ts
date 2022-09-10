import { EActions, EResource } from "@0xflick/models";
import { TPermission } from "../models";
import {
  Permission,
  PermissionAction,
  PermissionResource,
} from "../resolvers.generated";

export function graphqlPermissionActionToModel(
  action: PermissionAction
): EActions {
  switch (action) {
    case PermissionAction.Create:
      return EActions.CREATE;
    case PermissionAction.Update:
      return EActions.UPDATE;
    case PermissionAction.Delete:
      return EActions.DELETE;
    case PermissionAction.List:
      return EActions.LIST;
    case PermissionAction.Get:
      return EActions.GET;
    case PermissionAction.Use:
      return EActions.USE;
    case PermissionAction.Admin:
      return EActions.ADMIN;
    default:
      throw new Error(`Unknown permission action: ${action}`);
  }
}

export function modelPermissionActionToGraphql(
  action: EActions
): PermissionAction {
  switch (action) {
    case EActions.CREATE:
      return PermissionAction.Create;
    case EActions.UPDATE:
      return PermissionAction.Update;
    case EActions.DELETE:
      return PermissionAction.Delete;
    case EActions.LIST:
      return PermissionAction.List;
    case EActions.GET:
      return PermissionAction.Get;
    case EActions.USE:
      return PermissionAction.Use;
    case EActions.ADMIN:
      return PermissionAction.Admin;
    default:
      throw new Error(`Unknown permission action: ${action}`);
  }
}

export function graphqlPermissionResourceToModel(
  resource: PermissionResource
): EResource {
  switch (resource) {
    case PermissionResource.All:
      return EResource.ALL;
    case PermissionResource.User:
      return EResource.USER;
    case PermissionResource.UserRole:
      return EResource.USER_ROLE;
    case PermissionResource.Admin:
      return EResource.ADMIN;
    case PermissionResource.Presale:
      return EResource.PRESALE;
    case PermissionResource.Faucet:
      return EResource.FAUCET;
    case PermissionResource.Permission:
      return EResource.PERMISSION;
    case PermissionResource.Role:
      return EResource.ROLE;
    case PermissionResource.Affiliate:
      return EResource.AFFILIATE;
    default:
      throw new Error(`Unknown permission resource: ${resource}`);
  }
}

export function modelPermissionResourceToGraphql(
  resource: EResource
): PermissionResource {
  switch (resource) {
    case EResource.ALL:
      return PermissionResource.All;
    case EResource.USER:
      return PermissionResource.User;
    case EResource.USER_ROLE:
      return PermissionResource.UserRole;
    case EResource.ADMIN:
      return PermissionResource.Admin;
    case EResource.PRESALE:
      return PermissionResource.Presale;
    case EResource.FAUCET:
      return PermissionResource.Faucet;
    case EResource.PERMISSION:
      return PermissionResource.Permission;
    case EResource.ROLE:
      return PermissionResource.Role;
    case EResource.AFFILIATE:
      return PermissionResource.Affiliate;
    default:
      throw new Error(`Unknown permission resource: ${resource}`);
  }
}

export function modelPermissionToGraphql(permission: TPermission): Permission {
  return {
    action: modelPermissionActionToGraphql(permission.action),
    resource: modelPermissionResourceToGraphql(permission.resource),
    identifier: permission.identifier,
  };
}

export function graphqlPermissionToModel(permission: Permission): TPermission {
  return {
    action: graphqlPermissionActionToModel(permission.action),
    resource: graphqlPermissionResourceToModel(permission.resource),
    identifier: permission.identifier,
  };
}
