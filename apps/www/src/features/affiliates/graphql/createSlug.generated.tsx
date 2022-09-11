import * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CreateSlugMutationVariables = Types.Exact<{
  address: Types.Scalars['String'];
}>;


export type CreateSlugMutation = { __typename?: 'Mutation', affiliateForAddress: { __typename?: 'AffiliateMutation', createSlug: { __typename?: 'AffiliateMutation', slugs: Array<string> } } };


export const CreateSlugDocument = gql`
    mutation createSlug($address: String!) {
  affiliateForAddress(address: $address) {
    createSlug {
      slugs
    }
  }
}
    `;
export type CreateSlugMutationFn = Apollo.MutationFunction<CreateSlugMutation, CreateSlugMutationVariables>;

/**
 * __useCreateSlugMutation__
 *
 * To run a mutation, you first call `useCreateSlugMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSlugMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSlugMutation, { data, loading, error }] = useCreateSlugMutation({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useCreateSlugMutation(baseOptions?: Apollo.MutationHookOptions<CreateSlugMutation, CreateSlugMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSlugMutation, CreateSlugMutationVariables>(CreateSlugDocument, options);
      }
export type CreateSlugMutationHookResult = ReturnType<typeof useCreateSlugMutation>;
export type CreateSlugMutationResult = Apollo.MutationResult<CreateSlugMutation>;
export type CreateSlugMutationOptions = Apollo.BaseMutationOptions<CreateSlugMutation, CreateSlugMutationVariables>;