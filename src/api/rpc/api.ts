/* eslint-disable no-console */
import "@joystream/types";
import { ApiPromise, ApiRx, WsProvider } from "@polkadot/api";
import { ApiTypes } from "@polkadot/api/types";
import { firstValueFrom } from "rxjs";

type Api<T extends ApiTypes> = T extends "promise" ? ApiPromise : ApiRx;
export const getApi = async <T extends ApiTypes>(
  apiType: T,
  endpoint = "ws://127.0.0.1:9944"
): Promise<Api<T>> => {
  const provider = new WsProvider(endpoint);

  const api = await (apiType === "promise"
    ? ApiPromise.create({ provider })
    : firstValueFrom(ApiRx.create({ provider })));

  return api as Api<T>;
};

export async function withPromiseApi(endpoint: string) {
  const api = await getApi("promise", endpoint);

  return api;
}

export async function withRxApi(endpoint: string) {
  const api = await getApi("rxjs", endpoint);
  return api;
}
