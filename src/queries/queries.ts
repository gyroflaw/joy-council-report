import { GraphQLClient } from "graphql-request";
import { BN, BN_ZERO } from "@polkadot/util";

import { QN_URL } from "@/config";
import {
  asElectedCouncil,
  asProposal,
  asWorkingGroup,
  ElectedCouncil,
  Proposal,
  WorkingGroup,
} from "@/types";

import { getSdk } from "./__generated__/gql";

const client = new GraphQLClient(QN_URL);

export const getElectedCouncils = async (): Promise<ElectedCouncil[]> => {
  const { GetElectedCouncils } = getSdk(client);

  const councils = await GetElectedCouncils();

  return councils.electedCouncils.map(asElectedCouncil);
};

export const getElectedCouncilById = async (
  id: string
): Promise<ElectedCouncil> => {
  const { GetElectedCouncils } = getSdk(client);

  const council = await GetElectedCouncils({ where: { id_eq: `${id}` } });

  if (council.electedCouncils.length !== 1) {
    throw new Error(`No council found with id ${id}`);
  }

  return asElectedCouncil(council.electedCouncils[0]);
};

export const getWorkingGroups = async (
  _council: ElectedCouncil
): Promise<WorkingGroup[]> => {
  const { GetWorkingGroups } = getSdk(client);
  const workingGroups = await GetWorkingGroups();
  return workingGroups.workingGroups.map(asWorkingGroup);
};

// TODO
export const getCouncilBudget = async (_council: ElectedCouncil) => {
  const councilBudgets = {};

  return councilBudgets;
};

export const getWorkingGroupBudget = async (council: ElectedCouncil) => {
  const workingGroups = await getWorkingGroups(council);
  const { GetBudgetSpending } = getSdk(client);

  // calculate working group budgets
  const workingGroupBudgets = {};
  for await (const workingGroup of workingGroups) {
    const budgets = await GetBudgetSpending({
      where: {
        group: { id_eq: workingGroup.id },
        createdAt_gte: council.electedAt.timestamp,
        createdAt_lte: council.endedAt?.timestamp || undefined,
      },
    });
    const budget = budgets.budgetSpendingEvents.reduce(
      (total, { amount }) => total.add(new BN(amount)),
      BN_ZERO
    );
    // @ts-ignore
    workingGroupBudgets[workingGroup.id] = budget;
  }

  return workingGroupBudgets;
};

//
export const getCouncilVideoStatus = async (council: ElectedCouncil) => {
  const { GetVideoCount } = getSdk(client);

  const {
    videosConnection: { totalCount: startCount },
  } = await GetVideoCount({
    where: { createdAt_lte: council.electedAt.timestamp },
  });
  const {
    videosConnection: { totalCount: endCount },
  } = await GetVideoCount({
    where: { createdAt_lte: council.endedAt?.timestamp || undefined },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

export const getCouncilChannelStatus = async (council: ElectedCouncil) => {
  const { GetChannelsCount } = getSdk(client);

  const {
    channelsConnection: { totalCount: startCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: council.electedAt.timestamp },
  });
  const {
    channelsConnection: { totalCount: endCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: council.endedAt?.timestamp || undefined },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

// TODO
export const getCouncilMediaStatus = async (council: ElectedCouncil) => {
  const { GetChannelsCount } = getSdk(client);

  const {
    channelsConnection: { totalCount: startCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: council.electedAt.timestamp },
  });
  const {
    channelsConnection: { totalCount: endCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: council.endedAt?.timestamp || undefined },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

export const getCouncilVideoNftStatus = async (council: ElectedCouncil) => {
  const { GetNftIssuedCount } = getSdk(client);

  const {
    nftIssuedEventsConnection: { totalCount: startCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: council.electedAt.timestamp },
  });
  const {
    nftIssuedEventsConnection: { totalCount: endCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: council.endedAt?.timestamp || undefined },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

export const getCouncilMembershipStatus = async (council: ElectedCouncil) => {
  const { GetMembersCount } = getSdk(client);

  const {
    membershipsConnection: { totalCount: startCount },
  } = await GetMembersCount({
    where: { createdAt_lte: council.electedAt.timestamp },
  });
  const {
    membershipsConnection: { totalCount: endCount },
  } = await GetMembersCount({
    where: { createdAt_lte: council.endedAt?.timestamp || undefined },
  });
  const growthCount = endCount - startCount;
  const growthPercent = (growthCount / startCount) * 100;

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
  };
};

export const getCouncilProposals = async (
  council: ElectedCouncil
): Promise<Proposal[]> => {
  const { getProposals } = getSdk(client);
  const { proposals } = await getProposals({
    where: {
      createdAt_gt: council.electedAt.timestamp,
      createdAt_lt: council.endedAt?.timestamp,
    },
  });

  return proposals.map(asProposal);
};
