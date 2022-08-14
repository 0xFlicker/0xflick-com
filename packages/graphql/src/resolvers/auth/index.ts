import { gql } from "apollo-server-core";
import {
  mutation as mutationNonce,
  mutationSchema as mutationSchemaNonce,
  resolvers as resolversNonce,
  typeSchema as typeSchemaNonce,
} from "./nonce";
import { typeSchema as typeSchemaPermissions } from "./permissions";
import {
  mutationSchema as mutationSchemaSignIn,
  mutations as mutationsSignIn,
} from "./signIn";
import { resolvers as resolversWeb3Users } from "./web3User";
import {
  mutationSchema as mutationSchemaSignOut,
  mutations as mutationSignOut,
} from "./signOut";

export const typeSchema = gql`
  ${typeSchemaNonce}
  ${typeSchemaPermissions}
`;

export const mutationSchema = `
${mutationSchemaNonce}
${mutationSchemaSignIn}
${mutationSchemaSignOut}
`;

export const resolvers = {
  ...resolversNonce,
  ...resolversWeb3Users,
};

export const mutations = {
  ...mutationNonce,
  ...mutationsSignIn,
  ...mutationSignOut,
};
