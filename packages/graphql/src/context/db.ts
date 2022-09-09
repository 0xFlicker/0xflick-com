import {
  AuthOrchestrationDao,
  DrinkerDAO,
  NameFlickDAO,
  RolePermissionsDAO,
  RolesDAO,
  UrlShortenerDAO,
  UserDAO,
  UserRolesDAO,
  fetchTableNames,
  createDb as _createDb,
  AccountProviderDao,
  AccountUserDao,
  AffiliateDAO,
} from "@0xflick/backend";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export interface IDbOptions {
  ssmRegion?: string;
  ssmParamName?: string;
}
async function createDb({
  ssmRegion,
  ssmParamName,
}: IDbOptions = {}): Promise<DynamoDBDocumentClient> {
  console.log("Creating db...");
  const region = await fetchTableNames({
    region: ssmRegion,
    paramName: ssmParamName,
  });
  const db = _createDb({
    region,
  });
  return db;
}

export interface IDbContext {
  affiliateDao: AffiliateDAO;
  accountProviderDao: AccountProviderDao;
  accountUserDao: AccountUserDao;
  authOrchestrationDao: AuthOrchestrationDao;
  drinkerDao: DrinkerDAO;
  rolePermissionsDao: RolePermissionsDAO;
  rolesDao: RolesDAO;
  urlShortenerDao: UrlShortenerDAO;
  userDao: UserDAO;
  userRolesDao: UserRolesDAO;
  nameFlickDao: NameFlickDAO;
}

export async function createDbContext({
  ssmRegion,
  ssmParamName,
}: IDbOptions = {}): Promise<IDbContext> {
  const db = await createDb({
    ssmRegion,
    ssmParamName,
  });
  return {
    affiliateDao: new AffiliateDAO(db),
    authOrchestrationDao: new AuthOrchestrationDao(db),
    accountProviderDao: new AccountProviderDao(db),
    accountUserDao: new AccountUserDao(db),
    drinkerDao: new DrinkerDAO(db),
    rolePermissionsDao: new RolePermissionsDAO(db),
    rolesDao: new RolesDAO(db),
    urlShortenerDao: new UrlShortenerDAO(db),
    userDao: new UserDAO(db),
    userRolesDao: new UserRolesDAO(db),
    nameFlickDao: new NameFlickDAO(db),
  };
}
