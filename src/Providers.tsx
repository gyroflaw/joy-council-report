import React from "react";
import { ApolloProvider } from "@apollo/client";

import { RpcProvider, graphqlClient } from "./contexts";

export default function Providers({ children }: React.PropsWithChildren) {
  return (
    <ApolloProvider client={graphqlClient}>
      <RpcProvider>{children}</RpcProvider>
    </ApolloProvider>
  );
}
