import {
  defaultAdminStrategyAll,
  isOneOfActionOnResource,
} from "@0xflick/models";
import { EActions, EResource } from "@0xflick/models/src/permissions";

export const canSeeAdminPanel = defaultAdminStrategyAll(
  EResource.ADMIN,
  isOneOfActionOnResource(
    [EActions.LIST, EActions.UPDATE, EActions.USE],
    EResource.ADMIN
  )
);

export const canPreSaleMint = defaultAdminStrategyAll(
  EResource.PRESALE,
  isOneOfActionOnResource([EActions.USE], EResource.PRESALE)
);
