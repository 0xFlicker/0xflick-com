import { gql, useMutation } from "@apollo/client";
import {
  Web3SignOut,
  Web3SignOutVariables,
} from "./__generated__/web3-sign-out";

const WEB3_SIGN_OUT = gql`
  mutation Web3SignOut {
    signOut
  }
`;

export const useSignOut = (): ReturnType<
  typeof useMutation<Web3SignOut, Web3SignOutVariables>
> => {
  const [signOut, response] = useMutation<Web3SignOut, Web3SignOutVariables>(
    WEB3_SIGN_OUT
  );

  return [signOut, response];
};
