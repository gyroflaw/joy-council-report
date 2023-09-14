import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";

export async function getBlockHash(
  api: ApiPromise,
  blockNumber: number
): Promise<HexString> {
  // Get the block hash using the block number
  const hash = await api.rpc.chain.getBlockHash(blockNumber);

  return hash.toHex();
}
