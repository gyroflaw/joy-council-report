import { BN_ZERO } from "@polkadot/util";
import BN from "bn.js";

import {
  PastWorkerFieldsFragment,
  WorkerDetailedFieldsFragment,
  WorkerFieldsFragment,
} from "@/api/queries";

import { Address, asBlock, Block, castQueryResult } from "./common";
import { asMember, Member } from "./Member";
import { asWorkingGroupName, GroupIdName, WorkingGroup } from "./WorkingGroup";

export interface WorkerBaseInfo {
  member: Member;
  applicationId: string;
}

export interface Worker {
  id: string;
  runtimeId: number;
  membership: Pick<
    Member,
    "id" | "controllerAccount" | "boundAccounts" | "name"
  >;
  group: Pick<WorkingGroup, "id" | "name">;
  status: WorkerStatusTypename;
  isLead: boolean;
  rewardPerBlock: BN;
  owedReward: BN;
  stake: BN;
}

export interface WorkerWithDetails extends Worker {
  applicationId: string;
  openingId: string;
  roleAccount: Address;
  rewardAccount: Address;
  stakeAccount: Address;
  hiredAtBlock: Block;
  minStake: BN;
}

export interface PastWorker {
  id: string;
  member: Member;
  dateStarted: Block;
  dateFinished: Block;
}

export type WorkerStatus = "active" | "left" | "leaving" | "terminated";
export type WorkerStatusTypename =
  WorkerDetailedFieldsFragment["status"]["__typename"];
export const WorkerStatusToTypename: Record<
  WorkerStatus,
  WorkerFieldsFragment["status"]["__typename"]
> = {
  active: "WorkerStatusActive",
  left: "WorkerStatusLeft",
  leaving: "WorkerStatusLeaving",
  terminated: "WorkerStatusTerminated",
};

export const asWorkerBaseInfo = (
  fields: WorkerFieldsFragment
): WorkerBaseInfo => ({
  member: asMember(fields.membership),
  applicationId: fields.applicationId,
});

export const asWorker = (fields: WorkerFieldsFragment): Worker => ({
  id: fields.id,
  runtimeId: fields.runtimeId,
  group: {
    id: fields.group.id as GroupIdName,
    name: asWorkingGroupName(fields.group.name),
  },
  membership: {
    id: fields.membership.id,
    controllerAccount: fields.membership.controllerAccount,
    boundAccounts: fields.membership.boundAccounts,
    name: fields.membership.metadata.name ?? undefined,
  },
  status: fields.status.__typename,
  isLead: fields.isLead,
  rewardPerBlock: new BN(fields.rewardPerBlock),
  stake: new BN(fields.stake),
  owedReward: new BN(fields.missingRewardAmount || BN_ZERO),
});

export const asWorkerWithDetails = (
  fields: WorkerDetailedFieldsFragment
): WorkerWithDetails => ({
  ...asWorker(fields),
  applicationId: fields.application.id,
  openingId: fields.application.openingId,
  roleAccount: fields.roleAccount,
  rewardAccount: fields.rewardAccount,
  stakeAccount: fields.stakeAccount,
  minStake: new BN(fields.application.opening.stakeAmount),
  hiredAtBlock: asBlock(fields.entry),
});

export const asPastWorker = (fields: PastWorkerFieldsFragment): PastWorker => ({
  id: fields.id,
  member: asMember(fields.membership),
  dateStarted: asBlock(fields.entry),
  dateFinished: asBlock(
    castQueryResult(fields.status, "WorkerStatusTerminated")
      ?.terminatedWorkerEvent ??
      castQueryResult(fields.status, "WorkerStatusLeft")?.workerExitedEvent ??
      fields.entry
  ),
});
