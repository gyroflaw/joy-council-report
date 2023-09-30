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

export const getMembershipCount = async (date: Date) => {
  const { GetMembersCount } = getSdk(client);

  const {
    membershipsConnection: { totalCount },
  } = await GetMembersCount({
    where: { createdAt_lte: date },
  });
  return totalCount;
};

export const getCurrentWorkingGroups = async (): Promise<WorkingGroup[]> => {
  const { GetWorkingGroups } = getSdk(client);
  const { workingGroups } = await GetWorkingGroups();
  return workingGroups.map(asWorkingGroup);
};

export const getWorkingGroupSpending = async (
  start: Block & { hash: string },
  end: Block & { hash: string }
) => {
  const workingGroups = await getCurrentWorkingGroups();
  const { GetBudgetSpending, getFundingProposalPaid } = getSdk(client);

  // calculate working group budgets
  const spending = {} as {
    [key in WorkingGroup["id"]]: number;
  };
  for await (const workingGroup of workingGroups) {
    const { budgetSpendingEvents } = await GetBudgetSpending({
      where: {
        group: { id_eq: workingGroup.id },
        createdAt_gte: start.timestamp,
        createdAt_lte: end.timestamp,
      },
    });
    const wgSpending = budgetSpendingEvents.reduce(
      (total, { amount }) => total.add(new BN(amount)),
      BN_ZERO
    );

    spending[workingGroup.id] = toJoy(wgSpending);
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

  return { discretionarySpending: spending, leadSalary, workersSalary };
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

export const getWGBudgetRefills = async (start: Date, end: Date) => {
  const { getProposals } = getSdk(client);
  const refills = {} as {
    [key in WorkingGroup["id"]]: number;
  };

  const { proposals } = await getProposals({
    where: {
      isFinalized_eq: true,
      details_json: { isTypeOf_eq: "UpdateWorkingGroupBudgetProposalDetails" },
      status_json: { isTypeOf_eq: "ProposalStatusExecuted" },
      createdAt_gte: start,
      createdAt_lte: end,
    },
  });

  for (const proposal of proposals) {
    const {
      group: { id },
      amount,
    } = proposal.details as {
      __typename: string;
      group: {
        id: WorkingGroup["id"];
        __typename: string;
      };
      amount: string;
    };
    refills[id] =
      toJoy(new BN(amount)) + (isNaN(refills[id]) ? 0 : refills[id]);
  }
  return refills;
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

  const startDate = new Date(
    `${start.toISOString().slice(0, 11)}00:00:00.000Z`
  );
  const endDate = new Date(`${end.toISOString().slice(0, 11)}00:00:00.000Z`);

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
    date = new Date(date.getTime() + 24 * 3600 * 1000)
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

  const startDate = new Date(
    `${start.toISOString().slice(0, 11)}00:00:00.000Z`
  );
  const endDate = new Date(`${end.toISOString().slice(0, 11)}00:00:00.000Z`);

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
    date = new Date(date.getTime() + 24 * 3600 * 1000)
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
  const { GetNftIssuedCount, GetNftSales, GetNftSaleCount, GetAuctions } =
    getSdk(client);

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

  // calc nft sale volume
  const { nftBoughtEvents } = await GetNftSales({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  let totalVolume = BN_ZERO;
  totalVolume = nftBoughtEvents.reduce(
    (total, { price }) => total.add(new BN(price)),
    BN_ZERO
  );

  const { auctions } = await GetAuctions({
    where: { createdAt_gte: start, createdAt_lte: end, isCompleted_eq: true },
  });

  const auctionVolume = auctions.reduce(
    (total, { topBid }) => total.add(new BN(topBid ? topBid.amount : 0)),
    BN_ZERO
  );

  totalVolume = totalVolume.add(auctionVolume);

  const {
    nftBoughtEventsConnection: { totalCount },
  } = await GetNftSaleCount({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  return {
    startCount,
    endCount,
    growthCount,
    growthPercent,
    saleVolume: toJoy(totalVolume),
    saleQuantity: totalCount,
  };
};

export const getVideoNftChartData = async (start: Date, end: Date) => {
  const { GetNftIssuedCount } = getSdk(client);

  const startDate = new Date(
    `${start.toISOString().slice(0, 11)}00:00:00.000Z`
  );
  const endDate = new Date(`${end.toISOString().slice(0, 11)}00:00:00.000Z`);

  // iterate over days
  const data = [];

  const {
    nftIssuedEventsConnection: { totalCount },
  } = await GetNftIssuedCount({
    where: { createdAt_lte: new Date(startDate.getTime() - 24 * 3600 * 1000) },
  });
  let prevCount = totalCount;
  for (
    let date = startDate;
    date <= endDate;
    date = new Date(date.getTime() + 24 * 3600 * 1000)
  ) {
    const {
      nftIssuedEventsConnection: { totalCount },
    } = await GetNftIssuedCount({
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

  const startDate = new Date(
    `${start.toISOString().slice(0, 11)}00:00:00.000Z`
  );
  const endDate = new Date(`${end.toISOString().slice(0, 11)}00:00:00.000Z`);

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
    date = new Date(date.getTime() + 24 * 3600 * 1000)
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

export const getForumCategoryStatus = async (start: Date, end: Date) => {
  const { GetForumCategoriesCount } = getSdk(client);

  const {
    forumCategoriesConnection: { totalCount: startCount },
  } = await GetForumCategoriesCount({
    where: { createdAt_lte: start },
  });
  const {
    forumCategoriesConnection: { totalCount: endCount },
  } = await GetForumCategoriesCount({
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
  const [category, thread, post] = await Promise.all([
    getForumCategoryStatus(start, end),
    getForumThreadStatus(start, end),
    getForumPostStatus(start, end),
  ]);

  return { category, thread, post };
};

export const getWorkingGroupStatus = async (start: Date, end: Date) => {
  // TODO fix count
  const {
    GetWorkingGroupOpenings,
    GetWorkingGroupApplications,
    GetOpeningFilledEventsConnection,
    GetTerminatedWorkerEventsConnection,
    GetWorkerExitedEventsConnection,
  } = getSdk(client);

  const { workingGroupOpenings: openings } = await GetWorkingGroupOpenings({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  const { workingGroupApplications: applications } =
    await GetWorkingGroupApplications({
      where: { createdAt_gte: start, createdAt_lte: end },
    });

  const {
    openingFilledEventsConnection: { totalCount: filledCount },
  } = await GetOpeningFilledEventsConnection({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  const {
    terminatedWorkerEventsConnection: { totalCount: terminatedCount },
  } = await GetTerminatedWorkerEventsConnection({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  const {
    workerExitedEventsConnection: { totalCount: leftCount },
  } = await GetWorkerExitedEventsConnection({
    where: { createdAt_gte: start, createdAt_lte: end },
  });

  return {
    openings: openings.length,
    applications: applications.length,
    filledCount,
    terminatedCount,
    leftCount,
  };
};

export const getStorageStatus = async (start: Date, end: Date) => {
  const { GetStorageDataObjects } = getSdk(client);
  const { storageDataObjects } = await GetStorageDataObjects({
    where: {
      createdAt_gte: start,
      createdAt_lte: end,
    },
  });
  const size = storageDataObjects
    .map((d) => parseInt(d.size), 10)
    .reduce((a, b) => a + b, 0);

  return size;
};

export const getStorageChartData = async (start: Date, end: Date) => {
  const startDate = new Date(start.toDateString());
  const endDate = new Date(end.toDateString());

  // iterate over days
  const data = [];

  for (
    let date = startDate;
    date <= endDate;
    date = new Date(date.getTime() + 24 * 3600 * 1000)
  ) {
    const size = await getStorageStatus(
      date,
      new Date(date.getTime() + 24 * 3600 * 1000)
    );
    data.push({
      date: date,
      count: parseFloat((size / 1024 / 1024).toFixed(2)),
    });
  }

  return data;
};
