import React from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import { QN_URL } from "./config";

const client = new ApolloClient({
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

export default function Providers({ children }: React.PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
