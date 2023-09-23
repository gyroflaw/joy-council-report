import { ApiPromise } from "@polkadot/api";
import { HexString } from "@polkadot/util/types";

import { toJoy } from "@/helpers";
import { GroupIdToGroupParam, GroupIdName } from "@/types";

export async function getWorkingGroups(api: ApiPromise, block?: HexString) {
  const _api = block ? await api.at(block) : api;
  const promises = Object.keys(GroupIdToGroupParam).map(async (_group) => {
    const group = _group as GroupIdName;
    const budget = toJoy(await _api.query[group].budget());
    const currentLead = await _api.query[group].currentLead();
    const leadIdInWG = currentLead.isNone ? undefined : currentLead.unwrap();
    const leadMembershipId = leadIdInWG
      ? (await _api.query[group].workerById(leadIdInWG)).unwrap().memberId
      : undefined;

    const workers = await _api.query[group].activeWorkerCount();
    const wg = {
      id: group,
      leadMemebership: leadMembershipId
        ? leadMembershipId.toNumber()
        : undefined,
      budget,
      workers: workers.toNumber(),
    };
    return wg;
  });

  const wgs = await Promise.all(promises);

  return wgs;
}
