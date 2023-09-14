import { useContext } from "react";

import { RpcContext } from "./context";

export const useRpc = () => ({ ...useContext(RpcContext) });
