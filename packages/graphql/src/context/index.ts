import { IDeployConfig } from "@0xflick/backend";
import { SNS } from "@aws-sdk/client-sns";
import { GraphQLResolveInfo, OperationTypeNode } from "graphql";
import { MutationError } from "../errors/mutation";
import { createConfig } from "./config";
import { createDbContext, IDbContext, IDbOptions } from "./db";
import { createProviderContext, IProviderContext } from "./provider";

export interface ITokenContext {
  getToken: () => string | undefined;
  setToken: (token: string) => void;
  clearToken: () => void;
}
export type TRawContext = IDbContext &
  IProviderContext & {
    config: ReturnType<typeof createConfig>;
    isMutation(info: GraphQLResolveInfo): boolean;
    requireMutation(info: GraphQLResolveInfo): void;
    readonly sns: SNS;
  };
export type TContext = ITokenContext & TRawContext;
export type TOptions = IDbOptions;
export async function createContext(
  fullConfig: TOptions & Partial<IDeployConfig> = {}
): Promise<TRawContext> {
  const config = createConfig(fullConfig);
  let snsInstance: SNS | undefined;
  const snsGetter = () => {
    if (!snsInstance) {
      snsInstance = new SNS({
        apiVersion: "2010-03-31",
        region: config.sns.region,
      });
    }
    return snsInstance;
  };
  const self = {
    ...(await createDbContext({
      ssmParamName: fullConfig.ssmParamName,
      ssmRegion: fullConfig.ssmRegion,
    })),
    ...createProviderContext(config),
    config,
    isMutation(info: GraphQLResolveInfo): boolean {
      return info.operation.operation === OperationTypeNode.MUTATION;
    },
    requireMutation(info: GraphQLResolveInfo): void {
      if (!self.isMutation(info)) {
        throw new MutationError();
      }
    },
    get sns() {
      return snsGetter();
    },
  };
  return self;
}
