import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";

export async function getCouncilBudget(
  api: ApiPromise,
  startBlock: HexString,
  endBlock?: HexString
) {
  const startBudget = await (await api.at(startBlock)).query.council.budget();
  const endBudget = endBlock
    ? await (await api.at(endBlock)).query.council.budget()
    : undefined;
  const refilledBudget = await api.query.council.budgetIncrement();

  return { startBudget, endBudget, refilledBudget };
}
