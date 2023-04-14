import { IAffiliate, IRolePermission } from "@0xflick/models";
import { AffiliateModel } from "./AffiliateModel";
import { RoleModel } from "./RoleModel";
import {
  OpenSeaCollection,
  OpenSeaAssetContract,
  OpenSeaAsset,
  OpenSeaAccount,
  OpenSeaRarityData,
} from "./openSea";

export type TPermission = Omit<IRolePermission, "roleId">;

export type TRole = RoleModel;

export type TAffiliates = AffiliateModel;

export type TOpenSeaCollection = OpenSeaCollection;
export type TOpenSeaAssetContract = OpenSeaAssetContract;
export type TOpenSeaAsset = OpenSeaAsset;
export type TOpenSeaAccount = OpenSeaAccount;
export type TOpenSeaRarityData = OpenSeaRarityData;

export { RoleModel, AffiliateModel };
