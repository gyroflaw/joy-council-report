import * as Types from './baseTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetFundingProposalPaidQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.RequestFundedEventWhereInput>;
  orderBy?: Types.InputMaybe<Array<Types.RequestFundedEventOrderByInput> | Types.RequestFundedEventOrderByInput>;
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetFundingProposalPaidQuery = { __typename: 'Query', requestFundedEvents: Array<{ __typename: 'RequestFundedEvent', amount: string }> };


export const GetFundingProposalPaidDocument = gql`
    query getFundingProposalPaid($where: RequestFundedEventWhereInput, $orderBy: [RequestFundedEventOrderByInput!], $offset: Int, $limit: Int) {
  requestFundedEvents(
    where: $where
    orderBy: $orderBy
    offset: $offset
    limit: $limit
  ) {
    amount
  }
}
    `;

/**
 * __useGetFundingProposalPaidQuery__
 *
 * To run a query within a React component, call `useGetFundingProposalPaidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFundingProposalPaidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFundingProposalPaidQuery({
 *   variables: {
 *      where: // value for 'where'
 *      orderBy: // value for 'orderBy'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetFundingProposalPaidQuery(baseOptions?: Apollo.QueryHookOptions<GetFundingProposalPaidQuery, GetFundingProposalPaidQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFundingProposalPaidQuery, GetFundingProposalPaidQueryVariables>(GetFundingProposalPaidDocument, options);
      }
export function useGetFundingProposalPaidLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFundingProposalPaidQuery, GetFundingProposalPaidQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFundingProposalPaidQuery, GetFundingProposalPaidQueryVariables>(GetFundingProposalPaidDocument, options);
        }
export type GetFundingProposalPaidQueryHookResult = ReturnType<typeof useGetFundingProposalPaidQuery>;
export type GetFundingProposalPaidLazyQueryHookResult = ReturnType<typeof useGetFundingProposalPaidLazyQuery>;
export type GetFundingProposalPaidQueryResult = Apollo.QueryResult<GetFundingProposalPaidQuery, GetFundingProposalPaidQueryVariables>;