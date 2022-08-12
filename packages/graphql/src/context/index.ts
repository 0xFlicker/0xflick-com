import { createDbContext, IDbContext, IDbOptions } from "./db";
import { createProviderContext, IProviderContext } from "./provider";

export interface ITokenContext {
  getToken: () => string | undefined;
  setToken: (token: string) => void;
  clearToken: () => void;
}
export type TRawContext = IDbContext & IProviderContext;
export type TContext = ITokenContext & TRawContext;
export type TOptions = IDbOptions;
export async function createContext({
  ssmParamName,
  ssmRegion,
}: TOptions = {}): Promise<TRawContext> {
  return {
    ...(await createDbContext({
      ssmParamName,
      ssmRegion,
    })),
    ...createProviderContext(),
  };
}
