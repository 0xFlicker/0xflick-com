import * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SubmitPublicResolverMutationVariables = Types.Exact<{
  domain: Types.Scalars['ID'];
  addressEth: Types.Scalars['String'];
  textRecordEmail?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type SubmitPublicResolverMutation = { __typename?: 'Mutation', createOrUpdateNameflick: { __typename?: 'Nameflick', etherscan: string } };


export const SubmitPublicResolverDocument = gql`
    mutation submitPublicResolver($domain: ID!, $addressEth: String!, $textRecordEmail: String) {
  createOrUpdateNameflick(
    domain: $domain
    fields: {addresses: {eth: $addressEth}, textRecord: {email: $textRecordEmail}}
  ) {
    etherscan
  }
}
    `;
export type SubmitPublicResolverMutationFn = Apollo.MutationFunction<SubmitPublicResolverMutation, SubmitPublicResolverMutationVariables>;

/**
 * __useSubmitPublicResolverMutation__
 *
 * To run a mutation, you first call `useSubmitPublicResolverMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitPublicResolverMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitPublicResolverMutation, { data, loading, error }] = useSubmitPublicResolverMutation({
 *   variables: {
 *      domain: // value for 'domain'
 *      addressEth: // value for 'addressEth'
 *      textRecordEmail: // value for 'textRecordEmail'
 *   },
 * });
 */
export function useSubmitPublicResolverMutation(baseOptions?: Apollo.MutationHookOptions<SubmitPublicResolverMutation, SubmitPublicResolverMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitPublicResolverMutation, SubmitPublicResolverMutationVariables>(SubmitPublicResolverDocument, options);
      }
export type SubmitPublicResolverMutationHookResult = ReturnType<typeof useSubmitPublicResolverMutation>;
export type SubmitPublicResolverMutationResult = Apollo.MutationResult<SubmitPublicResolverMutation>;
export type SubmitPublicResolverMutationOptions = Apollo.BaseMutationOptions<SubmitPublicResolverMutation, SubmitPublicResolverMutationVariables>;