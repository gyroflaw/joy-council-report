import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";
import BN from "bn.js";

export async function getBalance(
  api: ApiPromise,
  address: string,
  blockHash?: HexString
): Promise<BN> {
  let _api = api;
  if (blockHash) {
    // @ts-ignore
    _api = await api.at(blockHash);
  }
  const {
    data: { free: balance },
  } = await _api.query.system.account(address);

  return balance;
}
