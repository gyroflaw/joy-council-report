import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";
import BN from "bn.js";

export async function getTotalSupply(
  api: ApiPromise,
  blockHash?: HexString
): Promise<BN> {
  let _api = api;
  if (blockHash) {
    // @ts-ignore
    _api = await api.at(blockHash);
  }
  const total = await _api.query.balances.totalIssuance();
  return total;
}
