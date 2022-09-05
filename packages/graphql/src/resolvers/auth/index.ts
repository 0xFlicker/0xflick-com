import { gql } from "apollo-server-core";
import {
  mutation as mutationNonce,
  resolvers as resolversNonce,
  typeSchema as typeSchemaNonce,
} from "./nonce";
import { mutations as mutationsSignIn } from "./signIn";
import {
  resolvers as resolversWeb3Users,
  typeSchema as typeSchemaWeb3Users,
  mutationResolvers as mutationResolversWeb3Users,
  queryResolvers as queryResolversWeb3Users,
} from "./web3User";
import { mutations as mutationSignOut } from "./signOut";
import { Resolvers } from "../../resolvers.generated";
import { TContext } from "../../context";

export const typeSchema = gql`
  ${typeSchemaNonce}
  ${typeSchemaWeb3Users}
`;

export const resolvers: Resolvers<TContext> = {
  ...resolversNonce,
  ...resolversWeb3Users,
};

export const mutationResolvers: Resolvers<TContext>["Mutation"] = {
  ...mutationNonce,
  ...mutationsSignIn,
  ...mutationSignOut,
  ...mutationResolversWeb3Users,
};

export const queryResolvers: Resolvers<TContext>["Query"] = {
  ...queryResolversWeb3Users,
};
