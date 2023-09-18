import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetStorageDataObjectsQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  where?: Types.InputMaybe<Types.StorageDataObjectWhereInput>;
  orderBy?: Types.InputMaybe<Array<Types.StorageDataObjectOrderByInput> | Types.StorageDataObjectOrderByInput>;
}>;


export type GetStorageDataObjectsQuery = { __typename: 'Query', storageDataObjects: Array<{ __typename: 'StorageDataObject', id: string, createdAt: any, size: string, videoMedia?: { __typename: 'Video', title?: string | null } | null }> };


export const GetStorageDataObjectsDocument = gql`
    query GetStorageDataObjects($offset: Int, $limit: Int, $where: StorageDataObjectWhereInput, $orderBy: [StorageDataObjectOrderByInput!]) {
  storageDataObjects(
    limit: $limit
    offset: $offset
    where: $where
    orderBy: $orderBy
  ) {
    id
    createdAt
    size
    videoMedia {
      title
    }
  }
}
    `;

/**
 * __useGetStorageDataObjectsQuery__
 *
 * To run a query within a React component, call `useGetStorageDataObjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStorageDataObjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStorageDataObjectsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetStorageDataObjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetStorageDataObjectsQuery, GetStorageDataObjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStorageDataObjectsQuery, GetStorageDataObjectsQueryVariables>(GetStorageDataObjectsDocument, options);
      }
export function useGetStorageDataObjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStorageDataObjectsQuery, GetStorageDataObjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStorageDataObjectsQuery, GetStorageDataObjectsQueryVariables>(GetStorageDataObjectsDocument, options);
        }
export type GetStorageDataObjectsQueryHookResult = ReturnType<typeof useGetStorageDataObjectsQuery>;
export type GetStorageDataObjectsLazyQueryHookResult = ReturnType<typeof useGetStorageDataObjectsLazyQuery>;
export type GetStorageDataObjectsQueryResult = Apollo.QueryResult<GetStorageDataObjectsQuery, GetStorageDataObjectsQueryVariables>;