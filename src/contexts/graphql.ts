import { ApolloClient, InMemoryCache } from "@apollo/client";

import { QN_URL } from "@/config";

export const graphqlClient = new ApolloClient({
  uri: QN_URL,
  cache: new InMemoryCache(),
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "standby",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
