import { ApiPromise } from "@polkadot/api";

import { ElectedCouncil } from "@/types";
import {
  getBalance,
  getBlockHash,
  getCouncilBudget,
  getCouncilChannelStatus,
  getCouncilMembershipStatus,
  getCouncilProposals,
  getCouncilVideoNftStatus,
  getCouncilVideoStatus,
  getTotalSupply,
  getWorkingGroupBudget,
} from "@/api";
import { MEXC_WALLET } from "@/config";
import { toJoy } from "./bn";

export async function generateReport(api: ApiPromise, council: ElectedCouncil) {
  // 1. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#general-1
  const startBlockHash = await getBlockHash(api, council.electedAt.number);
  const startBlock = {
    number: council.electedAt.number,
    hash: startBlockHash,
    timestamp: council.electedAt.timestamp,
  };
  const endBlockHash = council.endedAt
    ? await getBlockHash(api, council.endedAt.number)
    : undefined;
  const endBlock = council.endedAt
    ? {
        number: council.endedAt.number,
        hash: endBlockHash,
        timestamp: council.endedAt.timestamp,
      }
    : undefined;

  // 2. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#issuance
  const startIssuance = toJoy(await getTotalSupply(api, startBlockHash));
  // current issuance
  const endIssuance = toJoy(await getTotalSupply(api, endBlockHash));

  // 3. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#mexc-exchange-wallet
  const startBalance = toJoy(
    await getBalance(api, MEXC_WALLET, startBlockHash)
  );
  const endBalance = toJoy(await getBalance(api, MEXC_WALLET));
  const mexcBalChange = endBalance - startBalance;

  // 4. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#supply-1
  // TODO

  // 5. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#dao-spending
  // TODO

  // 6. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#council-budget
  const councilBudget = await getCouncilBudget(
    api,
    startBlockHash,
    endBlockHash
  );

  // 7. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#wg-budgets
  const workingGroupBudget = await getWorkingGroupBudget(council);

  // 8. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#videos
  const videoStatus = await getCouncilVideoStatus(council);

  // 9. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#channels
  const channelStatus = await getCouncilChannelStatus(council);

  // 10. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#media-storage
  // TODO

  // 11. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#video-nfts
  const videoNftStatus = await getCouncilVideoNftStatus(council);

  // 12. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#membership-1
  const membershipStatus = await getCouncilMembershipStatus(council);

  // 13. https://github.com/0x2bc/council/blob/main/Automation_Council_and_Weekly_Reports.md#proposals
  const proposals = (await getCouncilProposals(council)).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    createdAt: p.createdAt,
    councilApprovals: p.councilApprovals,
  }));

  return {
    general: {
      startBlock,
      endBlock,
    },
    issuance: {
      startIssuance,
      endIssuance,
    },
    mexc: {
      startBalance,
      endBalance,
      mexcBalChange,
    },
    councilBudget,
    workingGroupBudget,
    videoStatus,
    channelStatus,
    videoNftStatus,
    membershipStatus,
    proposals,
  };
}
