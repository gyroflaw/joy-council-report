import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetNftIssuedCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.NftIssuedEventWhereInput>;
}>;


export type GetNftIssuedCountQuery = { __typename: 'Query', nftIssuedEventsConnection: { __typename: 'NftIssuedEventConnection', totalCount: number } };

export type GetNftSaleCountQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.NftBoughtEventWhereInput>;
}>;


export type GetNftSaleCountQuery = { __typename: 'Query', nftBoughtEventsConnection: { __typename: 'NftBoughtEventConnection', totalCount: number } };

export type GetNftSalesQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.NftBoughtEventWhereInput>;
  orderBy?: Types.InputMaybe<Array<Types.NftBoughtEventOrderByInput> | Types.NftBoughtEventOrderByInput>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetNftSalesQuery = { __typename: 'Query', nftBoughtEvents: Array<{ __typename: 'NftBoughtEvent', videoId: string, memberId: string, price: string }> };

export type NftBoughtEventFieldFragment = { __typename: 'NftBoughtEvent', videoId: string, memberId: string, price: string };

export type GetAuctionsQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  where?: Types.InputMaybe<Types.AuctionWhereInput>;
  orderBy?: Types.InputMaybe<Array<Types.AuctionOrderByInput> | Types.AuctionOrderByInput>;
}>;


export type GetAuctionsQuery = { __typename: 'Query', auctions: Array<{ __typename: 'Auction', nftId: string, winningMemberId?: string | null, startingPrice: string, buyNowPrice?: string | null, isCanceled: boolean, isCompleted: boolean, topBid?: { __typename: 'Bid', bidderId: string, nftId: string, amount: string, isCanceled: boolean } | null }> };

export type BidFieldFragment = { __typename: 'Bid', bidderId: string, nftId: string, amount: string, isCanceled: boolean };

export const NftBoughtEventFieldFragmentDoc = gql`
    fragment NftBoughtEventField on NftBoughtEvent {
  videoId
  memberId
  price
}
    `;
export const BidFieldFragmentDoc = gql`
    fragment BidField on Bid {
  bidderId
  nftId
  amount
  isCanceled
}
    `;
export const GetNftIssuedCountDocument = gql`
    query GetNftIssuedCount($where: NftIssuedEventWhereInput) {
  nftIssuedEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetNftIssuedCountQuery__
 *
 * To run a query within a React component, call `useGetNftIssuedCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNftIssuedCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNftIssuedCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetNftIssuedCountQuery(baseOptions?: Apollo.QueryHookOptions<GetNftIssuedCountQuery, GetNftIssuedCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNftIssuedCountQuery, GetNftIssuedCountQueryVariables>(GetNftIssuedCountDocument, options);
      }
export function useGetNftIssuedCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNftIssuedCountQuery, GetNftIssuedCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNftIssuedCountQuery, GetNftIssuedCountQueryVariables>(GetNftIssuedCountDocument, options);
        }
export type GetNftIssuedCountQueryHookResult = ReturnType<typeof useGetNftIssuedCountQuery>;
export type GetNftIssuedCountLazyQueryHookResult = ReturnType<typeof useGetNftIssuedCountLazyQuery>;
export type GetNftIssuedCountQueryResult = Apollo.QueryResult<GetNftIssuedCountQuery, GetNftIssuedCountQueryVariables>;
export const GetNftSaleCountDocument = gql`
    query GetNftSaleCount($where: NftBoughtEventWhereInput) {
  nftBoughtEventsConnection(where: $where) {
    totalCount
  }
}
    `;

/**
 * __useGetNftSaleCountQuery__
 *
 * To run a query within a React component, call `useGetNftSaleCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNftSaleCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNftSaleCountQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetNftSaleCountQuery(baseOptions?: Apollo.QueryHookOptions<GetNftSaleCountQuery, GetNftSaleCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNftSaleCountQuery, GetNftSaleCountQueryVariables>(GetNftSaleCountDocument, options);
      }
export function useGetNftSaleCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNftSaleCountQuery, GetNftSaleCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNftSaleCountQuery, GetNftSaleCountQueryVariables>(GetNftSaleCountDocument, options);
        }
export type GetNftSaleCountQueryHookResult = ReturnType<typeof useGetNftSaleCountQuery>;
export type GetNftSaleCountLazyQueryHookResult = ReturnType<typeof useGetNftSaleCountLazyQuery>;
export type GetNftSaleCountQueryResult = Apollo.QueryResult<GetNftSaleCountQuery, GetNftSaleCountQueryVariables>;
export const GetNftSalesDocument = gql`
    query GetNftSales($where: NftBoughtEventWhereInput, $orderBy: [NftBoughtEventOrderByInput!], $offset: Int, $limit: Int) {
  nftBoughtEvents(
    offset: $offset
    limit: $limit
    where: $where
    orderBy: $orderBy
  ) {
    ...NftBoughtEventField
  }
}
    ${NftBoughtEventFieldFragmentDoc}`;

/**
 * __useGetNftSalesQuery__
 *
 * To run a query within a React component, call `useGetNftSalesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNftSalesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNftSalesQuery({
 *   variables: {
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetNftSalesQuery(baseOptions?: Apollo.QueryHookOptions<GetNftSalesQuery, GetNftSalesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNftSalesQuery, GetNftSalesQueryVariables>(GetNftSalesDocument, options);
      }
export function useGetNftSalesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNftSalesQuery, GetNftSalesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNftSalesQuery, GetNftSalesQueryVariables>(GetNftSalesDocument, options);
        }
export type GetNftSalesQueryHookResult = ReturnType<typeof useGetNftSalesQuery>;
export type GetNftSalesLazyQueryHookResult = ReturnType<typeof useGetNftSalesLazyQuery>;
export type GetNftSalesQueryResult = Apollo.QueryResult<GetNftSalesQuery, GetNftSalesQueryVariables>;
export const GetAuctionsDocument = gql`
    query GetAuctions($offset: Int, $limit: Int, $where: AuctionWhereInput, $orderBy: [AuctionOrderByInput!]) {
  auctions(offset: $offset, limit: $limit, where: $where, orderBy: $orderBy) {
    nftId
    winningMemberId
    startingPrice
    buyNowPrice
    isCanceled
    isCompleted
    topBid {
      ...BidField
    }
  }
}
    ${BidFieldFragmentDoc}`;

/**
 * __useGetAuctionsQuery__
 *
 * To run a query within a React component, call `useGetAuctionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAuctionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAuctionsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useGetAuctionsQuery(baseOptions?: Apollo.QueryHookOptions<GetAuctionsQuery, GetAuctionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAuctionsQuery, GetAuctionsQueryVariables>(GetAuctionsDocument, options);
      }
export function useGetAuctionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAuctionsQuery, GetAuctionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAuctionsQuery, GetAuctionsQueryVariables>(GetAuctionsDocument, options);
        }
export type GetAuctionsQueryHookResult = ReturnType<typeof useGetAuctionsQuery>;
export type GetAuctionsLazyQueryHookResult = ReturnType<typeof useGetAuctionsLazyQuery>;
export type GetAuctionsQueryResult = Apollo.QueryResult<GetAuctionsQuery, GetAuctionsQueryVariables>;