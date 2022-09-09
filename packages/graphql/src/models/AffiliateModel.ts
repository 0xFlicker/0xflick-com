import { AffiliateDAO, RolePermissionsDAO, RolesDAO } from "@0xflick/backend";
import { IAffiliate } from "@0xflick/models";
import { RoleModel } from "./RoleModel";

export class AffiliateModel {
  public readonly address: string;
  private affiliateDao: AffiliateDAO;
  private affiliates: IAffiliate[] | null = null;

  constructor(address: string, affiliateDao: AffiliateDAO) {
    this.address = address;
    this.affiliateDao = affiliateDao;
  }

  private async prime() {
    if (this.affiliates === null) {
      this.affiliates = await this.affiliateDao.getActiveForAddress(
        this.address
      );
    }
  }

  async slugs(): Promise<string[]> {
    await this.prime();
    return this.affiliates.map((a) => a.slug);
  }

  async role(
    rolesDao: RolesDAO,
    rolePermissionsDao: RolePermissionsDAO
  ): Promise<RoleModel> {
    await this.prime();
    // We assume all affiliates have the same roleId
    const roleId = this.affiliates[0].roleId;
    return new RoleModel(rolesDao, rolePermissionsDao, roleId);
  }
}
