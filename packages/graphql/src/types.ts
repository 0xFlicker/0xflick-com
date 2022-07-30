import { IResolvers } from "@graphql-tools/utils";
import { TContext } from "./context";

export type TGraphqlResolver = IResolvers<
  any,
  TContext,
  Record<string, any>,
  any
>;
