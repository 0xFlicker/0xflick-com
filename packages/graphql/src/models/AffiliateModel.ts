import { AffiliateDAO, RolePermissionsDAO, RolesDAO } from "@0xflick/backend";
import { IAffiliate } from "@0xflick/models";
import { AffiliatesError } from "../errors/affiliates";
import { RoleModel } from "./RoleModel";

export class AffiliateModel {
  public readonly address: string;
  private affiliateDao: AffiliateDAO;
  private _roleId: string | null = null;
  private affiliates: IAffiliate[] | null = null;

  constructor(address: string, affiliateDao: AffiliateDAO, roleId?: string) {
    this.address = address;
    this.affiliateDao = affiliateDao;
    this._roleId = roleId ?? null;
  }

  public invalidateSlugs() {
    this.affiliates = null;
  }

  private async prime() {
    await Promise.all([
      Promise.resolve().then(async () => {
        if (this.affiliates === null) {
          this.affiliates = await this.affiliateDao.getActiveForAddress(
            this.address
          );
        }
      }),
      Promise.resolve().then(async () => {
        if (this._roleId === null) {
          const rootAffiliate =
            await this.affiliateDao.getRootForAffiliateAddress(this.address);
          if (!rootAffiliate) {
            throw new AffiliatesError(
              `No role found for affiliate at ${this.address}`,
              "UNKNOWN_ROLE_ID"
            );
          }
          this._roleId = rootAffiliate.roleId;
        }
      }),
    ]);
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
    const roleId = this._roleId;
    return new RoleModel(rolesDao, rolePermissionsDao, roleId);
  }

  get roleId(): string {
    if (this._roleId === null) {
      throw new AffiliatesError(
        `No role found for affiliate at ${this.address}`,
        "UNKNOWN_ROLE_ID"
      );
    }
    return this._roleId;
  }
}
