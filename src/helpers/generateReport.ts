import { ApiPromise } from "@polkadot/api";

import {
  getBalance,
  getBlockHash,
  getCouncilBudget,
  getChannelStatus,
  getMembershipStatus,
  getProposals,
  getVideoNftStatus,
  getVideoStatus,
  getTotalSupply,
  getWorkingGroupSpending,
  getForumStatus,
  getWorkingGroupStatus,
  getFundingProposalPaid,
  getMembershipCount,
  getOfficialCirculatingSupply,
  getOfficialTotalSupply,
  getWorkingGroupBudget,
  getWGBudgetRefills,
  client as graphQLClient,
  getSdk,
  getWorkingGroups,
  getStorageStatus,
} from "@/api";
import { MEXC_WALLET } from "@/config";
import { toJoy } from "./bn";
import { BN } from "bn.js";
import { GroupIdName, ProposalStatus } from "@/types";

const INITIAL_SUPPLY = 1_000_000_000;

export async function generateReport1(api: ApiPromise, blockNumber: number) {
  const { GetVideoCount, GetChannelsCount, GetNftIssuedCount, GetMembers } =
    getSdk(graphQLClient);
  const blockHash = await getBlockHash(api, blockNumber);
  const blockTimestamp = new Date(
    (await (await api.at(blockHash)).query.timestamp.now()).toNumber()
  );
  const general = {
    block: blockNumber,
    hash: blockHash,
    timestamp: blockTimestamp,
  };

  const {
    videosConnection: { totalCount: videoCount },
  } = await GetVideoCount({
    where: { createdAt_lte: blockTimestamp },
  });

  const {
    channelsConnection: { totalCount: channelCount },
  } = await GetChannelsCount({
    where: {
      createdAt_lte: blockTimestamp,
    },
  });
  const {
    channelsConnection: { totalCount: nonEmptyChannelCount },
  } = await GetChannelsCount({
    where: {
      createdAt_lte: blockTimestamp,
      totalVideosCreated_gt: 0,
    },
  });
  // TODO: Total storage
  const {
    nftIssuedEventsConnection: { totalCount: nftCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: blockTimestamp },
  });

  const content = {
    videoCount,
    channelCount,
    nonEmptyChannelCount,
    nftCount,
  };

  const totalSupply = toJoy(await getTotalSupply(api, blockHash));
  const currentTotalSupply = await getOfficialTotalSupply();
  const currentCirculatingSupply = await getOfficialCirculatingSupply();

  const inflation = ((totalSupply - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;

  const supply = {
    totalSupply,
    currentTotalSupply,
    currentCirculatingSupply,
    inflation,
  };

  const totalMembership = await getMembershipCount(blockTimestamp);
  const workingGroups = await getWorkingGroups(api, blockHash);

  const { memberships } = await GetMembers({
    where: {
      id_in: workingGroups.map((w) => w.leadMemebership?.toString() || ""),
    },
  });
  workingGroups.forEach((wg, idx) => {
    workingGroups[idx] = {
      ...workingGroups[idx],
      // @ts-ignore
      leadMemebership: memberships.find(
        (m) => m.id === workingGroups[idx].leadMemebership?.toString()
      )?.handle,
    };
  });

  return {
    general,
    content,
    supply,
    totalMembership,
    workingGroups,
  };
}

// weekly report
export async function generateReport2(
  api: ApiPromise,
  startBlockNumber: number,
  endBlockNumber?: number
) {
  // 1. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#general-1
  const startBlockHash = await getBlockHash(api, startBlockNumber);
  const startBlockTimestamp = new Date(
    (await (await api.at(startBlockHash)).query.timestamp.now()).toNumber()
  );

  // const blockHeader = await api.rpc.chain.getBlock(startBlockHash);

  const startBlock = {
    number: startBlockNumber,
    hash: startBlockHash,
    timestamp: startBlockTimestamp,
  };

  // If end block number isn't provided use current block number
  if (!endBlockNumber) {
    const blockHeader = await api.rpc.chain.getHeader();
    const blockNumber = blockHeader.number.toNumber();
    endBlockNumber = blockNumber;
  }

  const endBlockHash = await getBlockHash(api, endBlockNumber);
  const endBlockTimestamp = new Date(
    (await (await api.at(endBlockHash)).query.timestamp.now()).toNumber()
  );
  const endBlock = {
    number: endBlockNumber,
    hash: endBlockHash,
    timestamp: endBlockTimestamp,
  };

  // 2. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#issuance
  const startIssuance = toJoy(await getTotalSupply(api, startBlockHash));
  const endIssuance = toJoy(await getTotalSupply(api, endBlockHash));
  const issuanceChange = endIssuance - startIssuance;

  // 3. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#mexc-exchange-wallet
  const startBalance = toJoy(
    await getBalance(api, MEXC_WALLET, startBlockHash)
  );
  const endBalance = toJoy(await getBalance(api, MEXC_WALLET, endBlockHash));
  const mexcBalChange = endBalance - startBalance;

  // 4. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#supply-1

  const startInflation =
    ((startIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const endInflation = ((endIssuance - INITIAL_SUPPLY) / INITIAL_SUPPLY) * 100;
  const inflationChange = endInflation - startInflation;
  // TODO mited/burned
  const supply = {
    inflationChange,
  };

  // 5. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#dao-spending
  // TODO: Check council rewards
  const councilMembers = await api.query.council.councilMembers();
  const councilorReward = await api.query.council.councilorReward();
  const councilRewards = toJoy(
    councilorReward.mul(
      new BN(councilMembers.length * (endBlockNumber - startBlockNumber))
    )
  );
  const workingGroupSpending = await getWorkingGroupSpending(
    startBlock,
    endBlock
  );
  const wgSpending = Object.values(
    workingGroupSpending.discretionarySpending
  ).reduce((a, b) => a + b, 0);
  const fundingProposals = toJoy(
    await getFundingProposalPaid(startBlockTimestamp, endBlockTimestamp)
  );
  const creatorPayoutRewards = toJoy(new BN(0));

  // TODO calc validator rewards
  // iterate all blocks and get validator reward per block and sum them up
  const validatorRewards = toJoy(new BN(0));

  const daoSpending = {
    councilRewards,
    wgSpending,
    fundingProposals,
    creatorPayoutRewards,
    validatorRewards,
    totalDaoSepnding: 0,
  };
  const totalDaoSepnding = Object.values(daoSpending).reduce(
    (a, b) => a + b,
    0
  );
  daoSpending["totalDaoSepnding"] = totalDaoSepnding;

  // 6. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#council-budget
  const councilBudget = await getCouncilBudget(
    api,
    startBlockHash,
    endBlockHash
  );

  // 7. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#wg-budgets
  const wgBudgets = (await getWorkingGroupBudget(
    api,
    startBlockHash,
    endBlockHash
  )) as {
    [key in GroupIdName]: {
      startBudget: number;
      endBudget: number | undefined;
      spending: number;
      refills: number;
    };
  };

  const refills = await getWGBudgetRefills(
    startBlockTimestamp,
    endBlockTimestamp
  );
  for (const r of Object.entries(refills)) {
    wgBudgets[r[0] as GroupIdName]["refills"] = r[1];
  }

  // add spending
  for (const spending of Object.entries(
    workingGroupSpending.discretionarySpending
  )) {
    wgBudgets[spending[0] as GroupIdName]["spending"] = spending[1];
  }

  const wgSalary = {
    leadSalary: workingGroupSpending.leadSalary,
    workersSalary: workingGroupSpending.workersSalary,
  };

  const workingGroup = {
    wgBudgets,
    wgSalary,
  };

  // 8. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#videos
  const videoStatus = await getVideoStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // 9. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#channels
  const nonEmptyChannelStatus = await getChannelStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // 10. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#media-storage
  // TODO

  // 11. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#video-nfts
  const videoNftStatus = await getVideoNftStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // 12. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#membership-1
  const membershipStatus = await getMembershipStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  // 13. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#proposals
  const proposals = (
    await getProposals(startBlockTimestamp, endBlockTimestamp)
  ).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt: p.createdAt,
    councilApprovals: p.councilApprovals,
  }));

  const executedProposals = proposals.filter((p) => p.status === "executed");

  const notPassedStatuses: ProposalStatus[] = [
    "vetoed",
    "executionFailed",
    "slashed",
    "rejected",
    "expired",
    "cancelled",
    "canceledByRuntime",
  ];
  const notPassedProposals = proposals.filter((p) =>
    notPassedStatuses.includes(p.status)
  );

  const underReviewStatuses: ProposalStatus[] = [
    "deciding",
    "gracing",
    "dormant",
  ];
  const underReviewProposals = proposals.filter((p) =>
    underReviewStatuses.includes(p.status)
  );

  return {
    general: {
      startBlock,
      endBlock,
    },
    issuance: {
      startIssuance,
      endIssuance,
      issuanceChange,
    },
    mexc: {
      startBalance,
      endBalance,
      mexcBalChange,
    },
    supply,
    daoSpending,
    councilBudget,
    workingGroup,
    videoStatus,
    nonEmptyChannelStatus,
    videoNftStatus,
    membershipStatus,
    proposals: {
      proposals,
      executedProposals,
      notPassedProposals,
      underReviewProposals,
    },
  };
}

// Council report
export async function generateReport4(
  api: ApiPromise,
  startBlockNumber: number,
  endBlockNumber: number
) {
  const startBlockHash = await getBlockHash(api, startBlockNumber);
  const startBlockTimestamp = new Date(
    (await (await api.at(startBlockHash)).query.timestamp.now()).toNumber()
  );
  const endBlockHash = await getBlockHash(api, endBlockNumber);
  const endBlockTimestamp = new Date(
    (await (await api.at(endBlockHash)).query.timestamp.now()).toNumber()
  );

  const nonEmptyChannel = await getChannelStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  const video = await getVideoStatus(startBlockTimestamp, endBlockTimestamp);

  // TODO: storage
  const totalStorageUsed = 0;
  const storageChanged = await getStorageStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  const forum = await getForumStatus(startBlockTimestamp, endBlockTimestamp);

  const proposals = await getProposals(startBlockTimestamp, endBlockTimestamp);
  const proposal = {
    total: proposals.length,
    passed: proposals.filter((p) => p.status === "executed").length,
    rejected: proposals.filter((p) => p.status === "rejected").length,
    expired: proposals.filter((p) => p.status === "expired").length,
  };

  const membership = await getMembershipStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );
  const workingGroup = await getWorkingGroupStatus(
    startBlockTimestamp,
    endBlockTimestamp
  );

  const councilBudget = await getCouncilBudget(
    api,
    startBlockHash,
    endBlockHash
  );

  // 7. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#wg-budgets
  const wgBudgets = (await getWorkingGroupBudget(
    api,
    startBlockHash,
    endBlockHash
  )) as {
    [key in GroupIdName]: {
      startBudget: number;
      endBudget: number | undefined;
      spending: number;
      refills: number;
    };
  };

  const refills = await getWGBudgetRefills(
    startBlockTimestamp,
    endBlockTimestamp
  );
  for (const r of Object.entries(refills)) {
    wgBudgets[r[0] as GroupIdName]["refills"] = r[1];
  }
  const startBlock = {
    number: startBlockNumber,
    hash: startBlockHash,
    timestamp: startBlockTimestamp,
  };
  const endBlock = {
    number: endBlockNumber,
    hash: endBlockHash,
    timestamp: endBlockTimestamp,
  };

  const workingGroupSpending = await getWorkingGroupSpending(
    startBlock,
    endBlock
  );
  const _wgSpending = Object.values(
    workingGroupSpending.discretionarySpending
  ).reduce((a, b) => a + b, 0);
  // add spending
  for (const spending of Object.entries(
    workingGroupSpending.discretionarySpending
  )) {
    wgBudgets[spending[0] as GroupIdName]["spending"] = spending[1];
  }
  // TODO council & wg available budget

  return {
    nonEmptyChannel,
    video,
    // unit GB
    storage: {
      totalStorageUsed,
      storageChanged: storageChanged / 1024 / 1024 / 1024,
    },
    councilBudget,
    wgBudgets,
    forum,
    proposal,
    membership,
    workingGroup,
  };
}
