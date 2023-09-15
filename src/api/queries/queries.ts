import { GraphQLClient } from "graphql-request";
import { BN, BN_ZERO } from "@polkadot/util";

import { QN_URL } from "@/config";
import {
  asElectedCouncil,
  asProposal,
  asWorkingGroup,
  Block,
  ElectedCouncil,
  Proposal,
  WorkingGroup,
} from "@/types";

import { getSdk } from "./__generated__/gql";
import { toJoy } from "@/helpers";

export { getSdk } from "./__generated__/gql";

export const client = new GraphQLClient(QN_URL);

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

export const getWorkingGroupBudget = async (start: Block, end: Block) => {
  const workingGroups = await getWorkingGroups();
  const { GetBudgetSpending, getFundingProposalPaid } = getSdk(client);

  // calculate working group budgets
  const spending = {} as {
    [key in WorkingGroup["id"]]: number;
  };
  for await (const workingGroup of workingGroups) {
    const budgets = await GetBudgetSpending({
      where: {
        group: { id_eq: workingGroup.id },
        createdAt_gte: start.timestamp,
        createdAt_lte: end.timestamp,
      },
    });
    const budget = budgets.budgetSpendingEvents.reduce(
      (total, { amount }) => total.add(new BN(amount)),
      BN_ZERO
    );

    spending[workingGroup.id] = toJoy(budget);
  }

  const budget = {} as {
    [key in WorkingGroup["id"]]: number;
  };
  for (const workingGroup of workingGroups) {
    budget[workingGroup.id] = toJoy(workingGroup.budget ?? BN_ZERO);
  }

  const leadSalary = {} as {
    [key in WorkingGroup["id"]]: number | undefined;
  };
  for (const workingGroup of workingGroups) {
    const { leader } = workingGroup;
    if (!leader) {
      continue;
    }
    let salary = BN_ZERO;
    const rewards = leader.rewardPerBlock.mul(
      new BN(end.number - start.number)
    );
    salary = salary.add(rewards);

    const proposalPaidPromise = getFundingProposalPaid({
      where: {
        account_in: leader.membership.boundAccounts,
        createdAt_gte: start.timestamp,
        createdAt_lte: end.timestamp,
      },
    });
    const directPaysPromise = GetBudgetSpending({
      where: {
        reciever_in: leader.membership.boundAccounts,
        createdAt_gte: start.timestamp,
        createdAt_lte: end.timestamp,
      },
    });
    const [proposalPaid, directPays] = await Promise.all([
      proposalPaidPromise,
      directPaysPromise,
    ]);

    const paid = proposalPaid.requestFundedEvents
      .map((e) => new BN(e.amount))
      .reduce((a, b) => a.add(b), BN_ZERO);
    salary = salary.add(paid);

    const discretionarySpending = directPays.budgetSpendingEvents.reduce(
      (total, { amount }) => total.add(new BN(amount)),
      BN_ZERO
    );
    salary = salary.add(discretionarySpending);
    leadSalary[workingGroup.id] = toJoy(salary);
  }

  const workersSalary = {} as {
    [key in WorkingGroup["id"]]: number;
  };
  for await (const workingGroup of workingGroups) {
    const salariesPromise = workingGroup.workers.map(async (worker) => {
      let salary = BN_ZERO;
      salary = salary.add(
        worker.rewardPerBlock.mul(new BN(end.number - start.number))
      );

      const proposalPaidPromise = getFundingProposalPaid({
        where: {
          account_in: worker.membership.boundAccounts,
          createdAt_gte: start.timestamp,
          createdAt_lte: end.timestamp,
        },
      });
      const directPaysPromise = GetBudgetSpending({
        where: {
          reciever_in: worker.membership.boundAccounts,
          createdAt_gte: start.timestamp,
          createdAt_lte: end.timestamp,
        },
      });
      const [proposalPaid, directPays] = await Promise.all([
        proposalPaidPromise,
        directPaysPromise,
      ]);

      const paid = proposalPaid.requestFundedEvents
        .map((e) => new BN(e.amount))
        .reduce((a, b) => a.add(b), BN_ZERO);
      salary = salary.add(paid);

      const discretionarySpending = directPays.budgetSpendingEvents.reduce(
        (total, { amount }) => total.add(new BN(amount)),
        BN_ZERO
      );

      salary = salary.add(discretionarySpending);
      return salary;
    });

    const salaries = await Promise.all(salariesPromise);
    const groupSalary = salaries.reduce((a, b) => a.add(b), BN_ZERO);
    workersSalary[workingGroup.id] = toJoy(groupSalary);
  }

  return { budget, spending, leadSalary, workersSalary };
};

export const getFundingProposalPaid = async (start: Date, end: Date) => {
  const { getFundingProposalPaid } = getSdk(client);
  const { requestFundedEvents } = await getFundingProposalPaid({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  const paid = requestFundedEvents
    .map((e) => new BN(e.amount))
    .reduce((a, b) => a.add(b), BN_ZERO);

  return paid;
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
    where: {
      createdAt_lte: start,
      totalVideosCreated_gt: 0,
    },
  });
  const {
    channelsConnection: { totalCount: endCount },
  } = await GetChannelsCount({
    where: { createdAt_lte: end, totalVideosCreated_gt: 0 },
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
    where: {
      createdAt_lte: new Date(startDate.getTime() - 24 * 3600 * 1000),
      totalVideosCreated_gt: 0,
    },
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
      where: { createdAt_lte: date.toISOString(), totalVideosCreated_gt: 0 },
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

export const getForumThreadStatus = async (start: Date, end: Date) => {
  const { GetForumThreadsCount } = getSdk(client);

  const {
    forumThreadsConnection: { totalCount: startCount },
  } = await GetForumThreadsCount({
    where: { createdAt_lte: start },
  });
  const {
    forumThreadsConnection: { totalCount: endCount },
  } = await GetForumThreadsCount({
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

export const getForumPostStatus = async (start: Date, end: Date) => {
  const { GetForumPostsCount } = getSdk(client);

  const {
    forumPostsConnection: { totalCount: startCount },
  } = await GetForumPostsCount({
    where: { createdAt_lte: start },
  });
  const {
    forumPostsConnection: { totalCount: endCount },
  } = await GetForumPostsCount({
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

export const getForumStatus = async (start: Date, end: Date) => {
  const [thread, post] = await Promise.all([
    getForumThreadStatus(start, end),
    getForumPostStatus(start, end),
  ]);

  return { thread, post };
};

export const getWorkingGroupStatus = async (start: Date, end: Date) => {
  const { GetWorkingGroupOpenings, GetWorkingGroupApplications } =
    getSdk(client);

  const { workingGroupOpenings: startOpenings } = await GetWorkingGroupOpenings(
    {
      where: { createdAt_lte: start },
    }
  );
  const { workingGroupOpenings: endOpenings } = await GetWorkingGroupOpenings({
    where: { createdAt_lte: end },
  });

  const { workingGroupApplications: startApplications } =
    await GetWorkingGroupApplications({
      where: { createdAt_lte: start },
    });
  const { workingGroupApplications: endApplications } =
    await GetWorkingGroupApplications({
      where: { createdAt_lte: end },
    });

  // TODO: Total Filled positions

  return {
    openings: {
      startCount: startOpenings.length,
      endCount: endOpenings.length,
    },
    applications: {
      startCount: startApplications.length,
      endCount: endApplications.length,
    },
  };
};
