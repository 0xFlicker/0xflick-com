import * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type RequestPresaleApprovalMutationVariables = Types.Exact<{
  affiliate?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type RequestPresaleApprovalMutation = { __typename?: 'Mutation', requestPresaleApproval: { __typename?: 'PresaleApprovalResponse', approved: boolean, token: string } };


export const RequestPresaleApprovalDocument = gql`
    mutation requestPresaleApproval($affiliate: String) {
  requestPresaleApproval(affiliate: $affiliate) {
    approved
    token
  }
}
    `;
export type RequestPresaleApprovalMutationFn = Apollo.MutationFunction<RequestPresaleApprovalMutation, RequestPresaleApprovalMutationVariables>;

/**
 * __useRequestPresaleApprovalMutation__
 *
 * To run a mutation, you first call `useRequestPresaleApprovalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestPresaleApprovalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestPresaleApprovalMutation, { data, loading, error }] = useRequestPresaleApprovalMutation({
 *   variables: {
 *      affiliate: // value for 'affiliate'
 *   },
 * });
 */
export function useRequestPresaleApprovalMutation(baseOptions?: Apollo.MutationHookOptions<RequestPresaleApprovalMutation, RequestPresaleApprovalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestPresaleApprovalMutation, RequestPresaleApprovalMutationVariables>(RequestPresaleApprovalDocument, options);
      }
export type RequestPresaleApprovalMutationHookResult = ReturnType<typeof useRequestPresaleApprovalMutation>;
export type RequestPresaleApprovalMutationResult = Apollo.MutationResult<RequestPresaleApprovalMutation>;
export type RequestPresaleApprovalMutationOptions = Apollo.BaseMutationOptions<RequestPresaleApprovalMutation, RequestPresaleApprovalMutationVariables>;