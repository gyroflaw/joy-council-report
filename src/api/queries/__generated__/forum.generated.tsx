import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetForumPostsCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.ForumPostWhereInput>;
}>;


export type GetForumPostsCountQuery = { __typename: 'Query', forumPostsConnection: { __typename: 'ForumPostConnection', totalCount: number }, forumPosts: Array<{ __typename: 'ForumPost', createdAt: any }> };

export type GetForumThreadsCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.ForumThreadWhereInput>;
}>;


export type GetForumThreadsCountQuery = { __typename: 'Query', forumThreadsConnection: { __typename: 'ForumThreadConnection', totalCount: number } };

export type GetForumCategoriesCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.ForumCategoryWhereInput>;
}>;


export type GetForumCategoriesCountQuery = { __typename: 'Query', forumCategoriesConnection: { __typename: 'ForumCategoryConnection', totalCount: number } };


export const GetForumPostsCountDocument = gql`
    query GetForumPostsCount($where: ForumPostWhereInput) {
  forumPostsConnection(first: 0, where: $where) {
    totalCount
  }
  forumPosts {
    createdAt
  }
}
    `;

/**
 * __useGetForumPostsCountQuery__
 *
 * To run a query within a React component, call `useGetForumPostsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetForumPostsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetForumPostsCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetForumPostsCountQuery(baseOptions?: Apollo.QueryHookOptions<GetForumPostsCountQuery, GetForumPostsCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetForumPostsCountQuery, GetForumPostsCountQueryVariables>(GetForumPostsCountDocument, options);
      }
export function useGetForumPostsCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetForumPostsCountQuery, GetForumPostsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetForumPostsCountQuery, GetForumPostsCountQueryVariables>(GetForumPostsCountDocument, options);
        }
export type GetForumPostsCountQueryHookResult = ReturnType<typeof useGetForumPostsCountQuery>;
export type GetForumPostsCountLazyQueryHookResult = ReturnType<typeof useGetForumPostsCountLazyQuery>;
export type GetForumPostsCountQueryResult = Apollo.QueryResult<GetForumPostsCountQuery, GetForumPostsCountQueryVariables>;
export const GetForumThreadsCountDocument = gql`
    query GetForumThreadsCount($where: ForumThreadWhereInput) {
  forumThreadsConnection(first: 0, where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetForumThreadsCountQuery__
 *
 * To run a query within a React component, call `useGetForumThreadsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetForumThreadsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetForumThreadsCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetForumThreadsCountQuery(baseOptions?: Apollo.QueryHookOptions<GetForumThreadsCountQuery, GetForumThreadsCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetForumThreadsCountQuery, GetForumThreadsCountQueryVariables>(GetForumThreadsCountDocument, options);
      }
export function useGetForumThreadsCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetForumThreadsCountQuery, GetForumThreadsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetForumThreadsCountQuery, GetForumThreadsCountQueryVariables>(GetForumThreadsCountDocument, options);
        }
export type GetForumThreadsCountQueryHookResult = ReturnType<typeof useGetForumThreadsCountQuery>;
export type GetForumThreadsCountLazyQueryHookResult = ReturnType<typeof useGetForumThreadsCountLazyQuery>;
export type GetForumThreadsCountQueryResult = Apollo.QueryResult<GetForumThreadsCountQuery, GetForumThreadsCountQueryVariables>;
export const GetForumCategoriesCountDocument = gql`
    query GetForumCategoriesCount($where: ForumCategoryWhereInput) {
  forumCategoriesConnection(first: 0, where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetForumCategoriesCountQuery__
 *
 * To run a query within a React component, call `useGetForumCategoriesCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetForumCategoriesCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetForumCategoriesCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetForumCategoriesCountQuery(baseOptions?: Apollo.QueryHookOptions<GetForumCategoriesCountQuery, GetForumCategoriesCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetForumCategoriesCountQuery, GetForumCategoriesCountQueryVariables>(GetForumCategoriesCountDocument, options);
      }
export function useGetForumCategoriesCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetForumCategoriesCountQuery, GetForumCategoriesCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetForumCategoriesCountQuery, GetForumCategoriesCountQueryVariables>(GetForumCategoriesCountDocument, options);
        }
export type GetForumCategoriesCountQueryHookResult = ReturnType<typeof useGetForumCategoriesCountQuery>;
export type GetForumCategoriesCountLazyQueryHookResult = ReturnType<typeof useGetForumCategoriesCountLazyQuery>;
export type GetForumCategoriesCountQueryResult = Apollo.QueryResult<GetForumCategoriesCountQuery, GetForumCategoriesCountQueryVariables>;