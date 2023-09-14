import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";
import BN from "bn.js";

export async function getTotalSupply(
  api: ApiPromise,
  blockHash: HexString
): Promise<BN> {
  const total = await (await api.at(blockHash)).query.balances.totalIssuance();
  return total;
}
