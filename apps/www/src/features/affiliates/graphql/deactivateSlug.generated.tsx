import * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeactivateSlugMutationVariables = Types.Exact<{
  address: Types.Scalars['String'];
  slug: Types.Scalars['String'];
}>;


export type DeactivateSlugMutation = { __typename?: 'Mutation', affiliateForAddress: { __typename?: 'AffiliateMutation', deactivate: { __typename?: 'AffiliateMutation', slugs: Array<string> } } };


export const DeactivateSlugDocument = gql`
    mutation deactivateSlug($address: String!, $slug: String!) {
  affiliateForAddress(address: $address) {
    deactivate(slug: $slug) {
      slugs
    }
  }
}
    `;
export type DeactivateSlugMutationFn = Apollo.MutationFunction<DeactivateSlugMutation, DeactivateSlugMutationVariables>;

/**
 * __useDeactivateSlugMutation__
 *
 * To run a mutation, you first call `useDeactivateSlugMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeactivateSlugMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deactivateSlugMutation, { data, loading, error }] = useDeactivateSlugMutation({
 *   variables: {
 *      address: // value for 'address'
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useDeactivateSlugMutation(baseOptions?: Apollo.MutationHookOptions<DeactivateSlugMutation, DeactivateSlugMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeactivateSlugMutation, DeactivateSlugMutationVariables>(DeactivateSlugDocument, options);
      }
export type DeactivateSlugMutationHookResult = ReturnType<typeof useDeactivateSlugMutation>;
export type DeactivateSlugMutationResult = Apollo.MutationResult<DeactivateSlugMutation>;
export type DeactivateSlugMutationOptions = Apollo.BaseMutationOptions<DeactivateSlugMutation, DeactivateSlugMutationVariables>;