import * as Types from '../../../graphql/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type IsFollowerQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type IsFollowerQuery = { __typename?: 'Query', self?: { __typename?: 'Web3User', isTwitterFollower: boolean } | null };


export const IsFollowerDocument = gql`
    query IsFollower {
  self {
    isTwitterFollower
  }
}
    `;

/**
 * __useIsFollowerQuery__
 *
 * To run a query within a React component, call `useIsFollowerQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsFollowerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsFollowerQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsFollowerQuery(baseOptions?: Apollo.QueryHookOptions<IsFollowerQuery, IsFollowerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IsFollowerQuery, IsFollowerQueryVariables>(IsFollowerDocument, options);
      }
export function useIsFollowerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IsFollowerQuery, IsFollowerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IsFollowerQuery, IsFollowerQueryVariables>(IsFollowerDocument, options);
        }
export type IsFollowerQueryHookResult = ReturnType<typeof useIsFollowerQuery>;
export type IsFollowerLazyQueryHookResult = ReturnType<typeof useIsFollowerLazyQuery>;
export type IsFollowerQueryResult = Apollo.QueryResult<IsFollowerQuery, IsFollowerQueryVariables>;