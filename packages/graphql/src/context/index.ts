import { createDbContext, IDbContext, IDbOptions } from "./db";
import { createProviderContext, IProviderContext } from "./provider";

export type TContext = IDbContext & IProviderContext;
export type TOptions = IDbOptions;
export async function createContext({
  ssmParamName,
  ssmRegion,
}: TOptions = {}): Promise<TContext> {
  return {
    ...(await createDbContext({
      ssmParamName,
      ssmRegion,
    })),
    ...createProviderContext(),
  };
}
