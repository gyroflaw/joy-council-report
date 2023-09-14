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
import { toJoy } from "@/helpers";

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

export const getWorkingGroups = async (): Promise<WorkingGroup[]> => {
  const { GetWorkingGroups } = getSdk(client);
  const workingGroups = await GetWorkingGroups();
  return workingGroups.workingGroups.map(asWorkingGroup);
};

export const getWorkingGroupBudget = async (start: Date, end: Date) => {
  const workingGroups = await getWorkingGroups();
  const { GetBudgetSpending } = getSdk(client);

  // calculate working group budgets
  const workingGroupBudget = {} as {
    [key in WorkingGroup["id"]]: BN;
  };
  for await (const workingGroup of workingGroups) {
    const budgets = await GetBudgetSpending({
      where: {
        group: { id_eq: workingGroup.id },
        createdAt_gte: start,
        createdAt_lte: end,
      },
    });
    const budget = budgets.budgetSpendingEvents.reduce(
      (total, { amount }) => total.add(new BN(amount)),
      BN_ZERO
    );
    // @ts-ignore
    workingGroupBudget[workingGroup.id] = toJoy(budget);
  }

  return workingGroupBudget;
};

//
export const getVideoStatus = async (start: Date, end: Date) => {
  const { GetVideoCount } = getSdk(client);

  const {
    videosConnection: { totalCount: startCount },
  } = await GetVideoCount({
    where: { createdAt_lte: start },
  });
  const {
    videosConnection: { totalCount: endCount },
  } = await GetVideoCount({
    where: { createdAt_lte: end },
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

export const getVideoChartData = async (start: Date, end: Date) => {
  const { GetVideoCount } = getSdk(client);

  const startDate = new Date(start.toDateString());
  const endDate = new Date(end.toDateString());

  // iterate over days
  const data = [];

  const {
    videosConnection: { totalCount },
  } = await GetVideoCount({
    where: { createdAt_lte: new Date(startDate.getTime() - 24 * 3600 * 1000) },
  });
  let prevCount = totalCount;
  for (
    let date = startDate;
    date <= endDate;
    date = new Date(date.setDate(date.getDate() + 1))
  ) {
    const {
      videosConnection: { totalCount },
    } = await GetVideoCount({
      where: { createdAt_lte: date.toISOString() },
    });
    data.push({
      date: date,
      count: totalCount - prevCount,
    });
    prevCount = totalCount;
  }

  return data;
};

// TODO: Check non-empty channel count logic
export const getChannelStatus = async (start: Date, end: Date) => {
  const { GetChannelsCount } = getSdk(client);

  const {
    channelsConnection: { totalCount: startCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: start },
  });
  const {
    channelsConnection: { totalCount: endCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: end },
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

export const getChannelChartData = async (start: Date, end: Date) => {
  const { GetChannelsCount } = getSdk(client);

  const startDate = new Date(start.toDateString());
  const endDate = new Date(end.toDateString());

  // iterate over days
  const data = [];

  const {
    channelsConnection: { totalCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: new Date(startDate.getTime() - 24 * 3600 * 1000) },
  });
  let prevCount = totalCount;
  for (
    let date = startDate;
    date <= endDate;
    date = new Date(date.setDate(date.getDate() + 1))
  ) {
    const {
      channelsConnection: { totalCount },
    } = await GetChannelsCount({
      where: { createdAt_lte: date.toISOString() },
    });
    data.push({
      date: date,
      count: totalCount - prevCount,
    });
    prevCount = totalCount;
  }

  return data;
};

// TODO
export const getMediaStatus = async (start: Date, end: Date) => {
  const { GetChannelsCount } = getSdk(client);

  const {
    channelsConnection: { totalCount: startCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: start },
  });
  const {
    channelsConnection: { totalCount: endCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: end },
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

export const getVideoNftStatus = async (start: Date, end: Date) => {
  const { GetNftIssuedCount } = getSdk(client);

  const {
    nftIssuedEventsConnection: { totalCount: startCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: start },
  });
  const {
    nftIssuedEventsConnection: { totalCount: endCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: end },
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

export const getMembershipStatus = async (start: Date, end: Date) => {
  const { GetMembersCount } = getSdk(client);

  const {
    membershipsConnection: { totalCount: startCount },
  } = await GetMembersCount({
    where: { createdAt_lte: start },
  });
  const {
    membershipsConnection: { totalCount: endCount },
  } = await GetMembersCount({
    where: { createdAt_lte: end },
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

export const getMembershipChartData = async (start: Date, end: Date) => {
  const { GetMembersCount } = getSdk(client);

  const startDate = new Date(start.toDateString());
  const endDate = new Date(end.toDateString());

  // iterate over days
  const data = [];

  const {
    membershipsConnection: { totalCount },
  } = await GetMembersCount({
    where: { createdAt_lte: new Date(startDate.getTime() - 24 * 3600 * 1000) },
  });
  let prevCount = totalCount;
  for (
    let date = startDate;
    date <= endDate;
    date = new Date(date.setDate(date.getDate() + 1))
  ) {
    const {
      membershipsConnection: { totalCount },
    } = await GetMembersCount({
      where: { createdAt_lte: date.toISOString() },
    });
    data.push({
      date: date,
      count: totalCount - prevCount,
    });
    prevCount = totalCount;
  }

  return data;
};

export const getProposals = async (
  start: Date,
  end: Date
): Promise<Proposal[]> => {
  const { getProposals } = getSdk(client);
  const { proposals } = await getProposals({
    where: {
      createdAt_gt: start,
      createdAt_lt: end,
    },
  });

  return proposals.map(asProposal);
};
