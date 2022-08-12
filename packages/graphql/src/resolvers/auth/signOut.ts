import { IFieldResolver } from "@graphql-tools/utils";
import { TContext } from "../../context";
import { TGraphqlResolver } from "../../types";

export const mutationSchema = `
  signOut: Boolean!
`;

export const mutations = {
  signOut: (async (_, __, { clearToken }) => {
    clearToken();
    return true;
  }) as IFieldResolver<
    any,
    TContext,
    { address: string; jwe: string },
    Promise<boolean>
  >,
} as TGraphqlResolver;
