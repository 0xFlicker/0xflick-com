import { IAffiliate, IRolePermission } from "@0xflick/models";
import { AffiliateModel } from "./AffiliateModel";
import { RoleModel } from "./RoleModel";

export type TPermission = Omit<IRolePermission, "roleId">;

export type TRole = RoleModel;

export type TAffiliates = AffiliateModel;

export { RoleModel, AffiliateModel };
