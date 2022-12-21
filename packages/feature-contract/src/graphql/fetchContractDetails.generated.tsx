import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FetchOpenSeaCollectionByAddressQueryVariables = Types.Exact<{
  address: Types.Scalars['String'];
}>;


export type FetchOpenSeaCollectionByAddressQuery = { __typename?: 'Query', openSeaCollectionByAddress?: { __typename?: 'OpenSeaCollection', id: string, name: string, slug: string, externalUrl?: string | null, twitterUsername?: string | null, description: string, imageUrl?: string | null, editors: Array<string> } | null };


export const FetchOpenSeaCollectionByAddressDocument = gql`
    query FetchOpenSeaCollectionByAddress($address: String!) {
  openSeaCollectionByAddress(address: $address) {
    id
    name
    slug
    externalUrl
    twitterUsername
    description
    imageUrl
    editors
  }
}
    `;

/**
 * __useFetchOpenSeaCollectionByAddressQuery__
 *
 * To run a query within a React component, call `useFetchOpenSeaCollectionByAddressQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchOpenSeaCollectionByAddressQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchOpenSeaCollectionByAddressQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useFetchOpenSeaCollectionByAddressQuery(baseOptions: Apollo.QueryHookOptions<FetchOpenSeaCollectionByAddressQuery, FetchOpenSeaCollectionByAddressQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchOpenSeaCollectionByAddressQuery, FetchOpenSeaCollectionByAddressQueryVariables>(FetchOpenSeaCollectionByAddressDocument, options);
      }
export function useFetchOpenSeaCollectionByAddressLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchOpenSeaCollectionByAddressQuery, FetchOpenSeaCollectionByAddressQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchOpenSeaCollectionByAddressQuery, FetchOpenSeaCollectionByAddressQueryVariables>(FetchOpenSeaCollectionByAddressDocument, options);
        }
export type FetchOpenSeaCollectionByAddressQueryHookResult = ReturnType<typeof useFetchOpenSeaCollectionByAddressQuery>;
export type FetchOpenSeaCollectionByAddressLazyQueryHookResult = ReturnType<typeof useFetchOpenSeaCollectionByAddressLazyQuery>;
export type FetchOpenSeaCollectionByAddressQueryResult = Apollo.QueryResult<FetchOpenSeaCollectionByAddressQuery, FetchOpenSeaCollectionByAddressQueryVariables>;