import * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EnrollAffiliateMutationVariables = Types.Exact<{
  address: Types.Scalars['String'];
}>;


export type EnrollAffiliateMutation = { __typename?: 'Mutation', createAffiliate: { __typename?: 'AffiliateMutation', role: { __typename?: 'Role', name: string } } };


export const EnrollAffiliateDocument = gql`
    mutation enrollAffiliate($address: String!) {
  createAffiliate(address: $address) {
    role {
      name
    }
  }
}
    `;
export type EnrollAffiliateMutationFn = Apollo.MutationFunction<EnrollAffiliateMutation, EnrollAffiliateMutationVariables>;

/**
 * __useEnrollAffiliateMutation__
 *
 * To run a mutation, you first call `useEnrollAffiliateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEnrollAffiliateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [enrollAffiliateMutation, { data, loading, error }] = useEnrollAffiliateMutation({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useEnrollAffiliateMutation(baseOptions?: Apollo.MutationHookOptions<EnrollAffiliateMutation, EnrollAffiliateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EnrollAffiliateMutation, EnrollAffiliateMutationVariables>(EnrollAffiliateDocument, options);
      }
export type EnrollAffiliateMutationHookResult = ReturnType<typeof useEnrollAffiliateMutation>;
export type EnrollAffiliateMutationResult = Apollo.MutationResult<EnrollAffiliateMutation>;
export type EnrollAffiliateMutationOptions = Apollo.BaseMutationOptions<EnrollAffiliateMutation, EnrollAffiliateMutationVariables>;