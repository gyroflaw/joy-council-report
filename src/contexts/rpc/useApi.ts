import { useContext } from "react";

import { RpcContext } from "./context";

export const useApi = () => ({ ...useContext(RpcContext) });
