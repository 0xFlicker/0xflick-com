import {
  AuthOrchestrationDao,
  DrinkerDAO,
  RolePermissionsDAO,
  RolesDAO,
  UrlShortenerDAO,
  UserDAO,
  UserRolesDAO,
  fetchTableNames,
  createDb as _createDb,
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
  authOrchestrationDao: AuthOrchestrationDao;
  drinkerDao: DrinkerDAO;
  rolePermissionsDao: RolePermissionsDAO;
  rolesDao: RolesDAO;
  urlShortenerDao: UrlShortenerDAO;
  userDao: UserDAO;
  userRolesDao: UserRolesDAO;
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
    authOrchestrationDao: new AuthOrchestrationDao(db),
    drinkerDao: new DrinkerDAO(db),
    rolePermissionsDao: new RolePermissionsDAO(db),
    rolesDao: new RolesDAO(db),
    urlShortenerDao: new UrlShortenerDAO(db),
    userDao: new UserDAO(db),
    userRolesDao: new UserRolesDAO(db),
  };
}
