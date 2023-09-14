import { createContext } from "react";

import { UseApi } from "./provider";

export const RpcContext = createContext<UseApi>({
  isConnected: false,
  api: undefined,
  connectionState: "connecting",
});
