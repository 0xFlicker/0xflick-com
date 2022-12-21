import { IAffiliate, IRolePermission } from "@0xflick/models";
import { AffiliateModel } from "./AffiliateModel";
import { RoleModel } from "./RoleModel";
import { OpenSeaCollection, OpenSeaAssetContract } from "./openSea";

export type TPermission = Omit<IRolePermission, "roleId">;

export type TRole = RoleModel;

export type TAffiliates = AffiliateModel;

export type TOpenSeaCollection = OpenSeaCollection;
export type TOpenSeaAssetContract = OpenSeaAssetContract;

export { RoleModel, AffiliateModel };
