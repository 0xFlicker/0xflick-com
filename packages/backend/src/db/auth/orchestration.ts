import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type {
  IAccountProvider,
  TProviderTypes,
  IVerificationRequest,
} from "@0xflick/models";
import { AccountProviderDao } from "./accountProvider";
import { AccountUserDao } from "./accountUser";
import { VerificationRequestDao } from "./verificationRequest";

export class AuthOrchestrationDao {
  public static TABLE_NAME = "ExternalAuth";
  private readonly db: DynamoDBDocumentClient;
  private readonly accountProviderDao: AccountProviderDao;
  private readonly accountUserDao: AccountUserDao;
  private readonly verificationDao: VerificationRequestDao;

  constructor(db: DynamoDBDocumentClient) {
    this.db = db;
    this.accountProviderDao = new AccountProviderDao(db);
    this.accountUserDao = new AccountUserDao(db);
    this.verificationDao = new VerificationRequestDao(db);
  }

  public async createState(verifier: IVerificationRequest) {
    return this.verificationDao.create(verifier);
  }

  public async verifyState(
    state: string,
    provider: TProviderTypes
  ): Promise<IVerificationRequest | null> {
    const verification = await this.verificationDao.get(state);
    if (!verification) {
      return null;
    }
    await this.verificationDao.delete(state);
    if (state !== verification.state || verification.provider !== provider) {
      console.warn(
        `State mismatch: ${state} !== ${verification.state} || ${provider} !== ${verification.provider}`
      );
      return null;
    }
    return verification;
  }

  public async doesAccountForAddressExist(
    addressToCheck: string,
    provider: TProviderTypes,
    providerAccountId: string
  ): Promise<{
    notYetCreated: boolean;
    alreadyConnectedWithDifferentAddress: boolean;
    alreadyConnectedAddress?: string;
  }> {
    const accountProviders = await this.accountProviderDao.getByProviderId(
      provider,
      providerAccountId
    );
    const notYetCreated = !accountProviders || accountProviders.length === 0;
    const alreadyConnectedAddress =
      accountProviders &&
      accountProviders.length > 0 &&
      accountProviders.find(({ address }) => addressToCheck !== address);
    return {
      notYetCreated,
      alreadyConnectedWithDifferentAddress: !!alreadyConnectedAddress,
      alreadyConnectedAddress:
        (alreadyConnectedAddress && alreadyConnectedAddress.address) ||
        undefined,
    };
  }

  public async updateAccountProvider(accountProvider: IAccountProvider) {
    await this.accountProviderDao.createOrUpdate(accountProvider);
  }

  public async createAccountForAddress(
    account: IAccountProvider,
    follower: boolean
  ) {
    await Promise.all([
      this.accountProviderDao.createOrUpdate({
        address: account.address,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        accessToken: account.accessToken,
      }),
      this.accountUserDao.create({
        address: account.address,
        twitterFollower: follower,
      }),
    ]);
  }

  public async disconnectUserFromProvider(
    address: string,
    provider: TProviderTypes,
    providerAccountId: string
  ) {
    await this.accountProviderDao.delete({
      address,
      provider,
      providerAccountId,
    });
  }
}
