import React, { ReactNode, useEffect, useState } from "react";
import { ApiPromise } from "@polkadot/api";

import { withPromiseApi } from "@/api";
import { NODE_SOCKET } from "@/config";

import { RpcContext } from "./context";

interface Props {
  children: ReactNode;
}

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface BaseAPI {
  api?: ApiPromise;
  isConnected: boolean;
  connectionState: ConnectionState;
}

interface APIConnecting extends BaseAPI {
  api: undefined;
  isConnected: false;
  connectionState: "connecting";
}

interface APIConnected extends BaseAPI {
  api: ApiPromise;
  isConnected: true;
  connectionState: "connected";
}

interface APIDisconnected extends BaseAPI {
  api: undefined;
  isConnected: false;
  connectionState: "disconnected";
}

export type UseApi = APIConnecting | APIConnected | APIDisconnected;

export const RpcProvider = ({ children }: Props) => {
  const [api, setApi] = useState<ApiPromise>();
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  useEffect(() => {
    withPromiseApi(NODE_SOCKET).then((api) => {
      setApi(api);
      setConnectionState("connected");
      api.on("connected", () => setConnectionState("connected"));
      api.on("disconnected", () => setConnectionState("disconnected"));
    });
  }, []);

  if (connectionState === "connecting") {
    return (
      <RpcContext.Provider
        value={{
          isConnected: false,
          api: undefined,
          connectionState,
        }}
      >
        {children}
      </RpcContext.Provider>
    );
  }

  if (connectionState === "connected") {
    return (
      <RpcContext.Provider
        value={{
          isConnected: true,
          api: api as ApiPromise,
          connectionState,
        }}
      >
        {children}
      </RpcContext.Provider>
    );
  }

  if (connectionState === "disconnected") {
    return (
      <RpcContext.Provider
        value={{
          isConnected: false,
          api: undefined,
          connectionState,
        }}
      >
        {children}
      </RpcContext.Provider>
    );
  }

  return null;
};
