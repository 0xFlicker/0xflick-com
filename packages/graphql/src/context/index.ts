import { IDeployConfig } from "@0xflick/backend";
import { createDbContext, IDbContext, IDbOptions } from "./db";
import { createProviderContext, IProviderContext } from "./provider";

export interface ITokenContext {
  getToken: () => string | undefined;
  setToken: (token: string) => void;
  clearToken: () => void;
}
export type TRawContext = IDbContext &
  IProviderContext & {
    config: IDeployConfig;
  };
export type TContext = ITokenContext & TRawContext;
export type TOptions = IDbOptions;
export async function createContext(
  fullConfig: TOptions & Partial<IDeployConfig> = {}
): Promise<TRawContext> {
  const config = {
    chains: fullConfig.chains,
    infraIpfsProjectId: fullConfig.infraIpfsProjectId,
    infraIpfsSecret: fullConfig.infraIpfsSecret,
    infraIpfsUrl: fullConfig.infraIpfsUrl,
  };
  return {
    ...(await createDbContext({
      ssmParamName: fullConfig.ssmParamName,
      ssmRegion: fullConfig.ssmRegion,
    })),
    ...createProviderContext(config),
    config,
  };
}
