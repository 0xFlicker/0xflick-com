import { gql } from "apollo-server-core";
import { TGraphqlResolver } from "../../types";

export const typeSchema = gql`
  type Nonce {
    nonce: Int!
  }
`;
export interface IGraphqlNonce {
  nonce: number;
}

export const mutationSchema = `
  nonceForAddress(address: String!): Nonce
`;

export const resolvers = {} as TGraphqlResolver;

export const mutation = {
  async nonceForAddress(_, { address }, { userDao }) {
    const user = await userDao.getUser(address);
    if (!user) {
      return { nonce: 0 };
    }
    return { nonce: user.nonce };
  },
} as TGraphqlResolver;
