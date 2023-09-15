import BN from "bn.js";

import { sumStakes } from "@/helpers";
import {
  WorkerFieldsFragment,
  WorkingGroupDetailedFieldsFragment,
} from "@/api/queries";
import { asWorkerWithDetails, WorkerWithDetails } from "./Worker";

export const GroupIdToGroupParam = {
  contentWorkingGroup: "Content",
  forumWorkingGroup: "Forum",
  appWorkingGroup: "App",
  membershipWorkingGroup: "Membership",
  distributionWorkingGroup: "Distribution",
  storageWorkingGroup: "Storage",
  operationsWorkingGroupAlpha: "OperationsAlpha",
  operationsWorkingGroupBeta: "OperationsBeta",
  operationsWorkingGroupGamma: "OperationsGamma",
} as const;

export type GroupIdName = keyof typeof GroupIdToGroupParam;

export interface WorkingGroup {
  id: GroupIdName;
  name: string;
  image?: string;
  about?: string;
  leader?: WorkerWithDetails;
  workers: WorkerWithDetails[];
  status?: string;
  description?: string;
  statusMessage?: string;
  budget?: BN;
  averageStake?: BN;
  isActive?: boolean;
}

export const asWorkingGroup = (
  group: WorkingGroupDetailedFieldsFragment
): WorkingGroup => {
  return {
    id: group.id as GroupIdName,
    image: undefined,
    name: asWorkingGroupName(group.name),
    about: group.metadata?.about ?? "",
    description: group.metadata?.description ?? "",
    status: group.metadata?.status ?? "",
    statusMessage: group.metadata?.statusMessage ?? "",
    budget: new BN(group.budget),
    averageStake: getAverageStake(group.workers),
    leader: group.leader ? asWorkerWithDetails(group.leader) : undefined,
    workers: group.workers.map(asWorkerWithDetails),
    isActive: group.leader?.isActive ?? false,
  };
};

export const asWorkingGroupName = (name: string) =>
  name
    .replace("WorkingGroup", "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^[a-z]/, (match) => match.toUpperCase());

export const getAverageStake = (
  workers: Pick<WorkerFieldsFragment, "stake">[]
) => sumStakes(workers).divn(workers.length);
