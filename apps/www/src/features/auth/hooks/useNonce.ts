import { gql, useMutation } from "@apollo/client";
import { GetNonce, GetNonceVariables } from "./__generated__/get-nonce";

const GET_NONCE = gql`
  mutation GetNonce($address: String!) {
    nonceForAddress(address: $address) {
      nonce
    }
  }
`;

export const useNonce = (): ReturnType<
  typeof useMutation<GetNonce, GetNonceVariables>
> => {
  const [getNonce, response] = useMutation<GetNonce, GetNonceVariables>(
    GET_NONCE
  );

  return [getNonce, response];
};
