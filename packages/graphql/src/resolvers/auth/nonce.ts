import { gql } from "apollo-server-core";
import { TContext } from "../../context";
import { Resolvers } from "../../resolvers.generated";

export const typeSchema = gql`
  type Nonce {
    nonce: Int!
  }
`;

export const resolvers = {} as Resolvers<TContext>;

export const mutation: Resolvers<TContext>["Mutation"] = {
  async nonceForAddress(_, { address }, { userDao }) {
    const user = await userDao.getUser(address);
    if (!user) {
      return { nonce: 0 };
    }
    return { nonce: user.nonce };
  },
};
