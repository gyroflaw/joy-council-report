import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";
import BN from "bn.js";

export async function getTotalSupply(
  api: ApiPromise,
  blockHash?: HexString
): Promise<BN> {
  const _api = blockHash ? await api.at(blockHash) : api;

  const total = await _api.query.balances.totalIssuance();
  return total;
}
