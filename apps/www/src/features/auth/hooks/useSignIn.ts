import { gql, useMutation } from "@apollo/client";
import { Web3SignIn, Web3SignInVariables } from "./__generated__/web3-sign-in";

const WEB3_SIGN_IN = gql`
  mutation Web3SignIn($address: String!, $jwe: String!) {
    signIn(address: $address, jwe: $jwe) {
      token
    }
  }
`;

export const useSignIn = (): ReturnType<
  typeof useMutation<Web3SignIn, Web3SignInVariables>
> => {
  const [signIn, response] = useMutation<Web3SignIn, Web3SignInVariables>(
    WEB3_SIGN_IN
  );

  return [signIn, response];
};
