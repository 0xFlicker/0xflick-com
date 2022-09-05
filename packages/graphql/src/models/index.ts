import { IRolePermission } from "@0xflick/models";

export type TPermission = Omit<IRolePermission, "roleId">;

export type TRole = {
  id: string;
  name: string;
  permissions: TPermission[];
};
