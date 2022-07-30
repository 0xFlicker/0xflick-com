import {
  gql,
  LazyQueryExecFunction,
  QueryResult,
  useLazyQuery,
} from "@apollo/client";
import { GetNonce, GetNonceVariables } from "./__generated__/get-nonce";

const GET_NONCE = gql`
  query GetNonce($address: String!) {
    nonceForAddress(address: $address) {
      nonce
    }
  }
`;

export const useNonce = (): [
  LazyQueryExecFunction<GetNonce, GetNonceVariables>,
  QueryResult<GetNonce, GetNonceVariables>
] => {
  const [getNonce, response] = useLazyQuery<GetNonce, GetNonceVariables>(
    GET_NONCE
  );

  return [getNonce, response];
};
