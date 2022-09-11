import * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type SlugsQueryVariables = Types.Exact<{
  address: Types.Scalars['String'];
}>;


export type SlugsQuery = { __typename?: 'Query', affiliateForAddress: { __typename?: 'AffiliateQuery', slugs: Array<string> } };


export const SlugsDocument = gql`
    query slugs($address: String!) {
  affiliateForAddress(address: $address) {
    slugs
  }
}
    `;

/**
 * __useSlugsQuery__
 *
 * To run a query within a React component, call `useSlugsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSlugsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSlugsQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useSlugsQuery(baseOptions: Apollo.QueryHookOptions<SlugsQuery, SlugsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SlugsQuery, SlugsQueryVariables>(SlugsDocument, options);
      }
export function useSlugsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SlugsQuery, SlugsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SlugsQuery, SlugsQueryVariables>(SlugsDocument, options);
        }
export type SlugsQueryHookResult = ReturnType<typeof useSlugsQuery>;
export type SlugsLazyQueryHookResult = ReturnType<typeof useSlugsLazyQuery>;
export type SlugsQueryResult = Apollo.QueryResult<SlugsQuery, SlugsQueryVariables>;