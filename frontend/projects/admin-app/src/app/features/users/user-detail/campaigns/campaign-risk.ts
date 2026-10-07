const TICK_MS = 10_000;
const TEST_DURATION_MS = 5 * 60 * 1000;

export type RiskCampaignInput = {
  createdAt: string | null;
  endDate: string;
  budget: number;
  cpm: number;
  epc: number;
  ctr: number;
  participation: number;
  riskMode: number;
  riskSpent: number;
  riskImpressions: number;
  riskClicks: number;
  riskRevenue: number;
};

export type RiskCampaignSnapshot = {
  impressions: number;
  clicks: number;
  revenue: number;
  grossProfit: number;
  netProfit: number;
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function impressionsFor(budget: number, cpm: number): number {
  if (budget <= 0 || cpm <= 0) {
    return 0;
  }
  return Math.trunc(roundMoney(budget / cpm) * 1000);
}

function deliveryFraction(createdAt: string | null, now: number): number {
  if (!createdAt) {
    return 0;
  }
  const openedAt = new Date(createdAt).getTime();
  if (!Number.isFinite(openedAt)) {
    return 0;
  }
  const endsAt = openedAt + TEST_DURATION_MS;
  if (now >= endsAt) {
    return 1;
  }
  if (now <= openedAt) {
    return 0;
  }
  const totalTicks = Math.max(1, Math.round(TEST_DURATION_MS / TICK_MS));
  const elapsedTicks = Math.min(totalTicks, Math.floor((now - openedAt) / TICK_MS));
  return elapsedTicks / totalTicks;
}

function economics(input: {
  budget: number;
  impressions: number;
  clicks: number;
  revenue: number;
  participation: number;
}): RiskCampaignSnapshot {
  const budget = roundMoney(Math.max(0, input.budget));
  const revenue = roundMoney(Math.max(0, input.revenue));
  const grossProfit = roundMoney(revenue - budget);
  const share = Math.min(100, Math.max(0, Math.round(input.participation)));
  const netProfit = grossProfit >= 0 ? roundMoney((grossProfit * share) / 100) : grossProfit;
  return {
    impressions: Math.max(0, input.impressions),
    clicks: Math.max(0, input.clicks),
    revenue,
    grossProfit,
    netProfit,
  };
}

export function riskTargetText(riskMode: number): string {
  if (riskMode <= 0) {
    return 'Natural result';
  }
  if (riskMode <= 100) {
    return `Ends at ${100 - riskMode}% of budget`;
  }
  return `Ends at ${riskMode}% of budget`;
}

export function liveRiskSnapshot(input: RiskCampaignInput, now = Date.now()): RiskCampaignSnapshot {
  const fraction = deliveryFraction(input.createdAt, now);
  const budget = roundMoney(Math.max(0, input.budget));
  const spent = fraction >= 1 ? budget : roundMoney(budget * fraction);

  if (input.riskMode <= 0) {
    const views = impressionsFor(spent, input.cpm);
    const clicks = Math.trunc(views * (input.ctr / 100));
    const revenue = roundMoney(clicks * input.epc);
    const grossProfit = roundMoney(revenue - spent);
    const share = Math.min(100, Math.max(0, Math.round(input.participation)));
    return {
      impressions: views,
      clicks,
      revenue,
      grossProfit,
      netProfit: roundMoney(Math.max(0, grossProfit) * (share / 100)),
    };
  }

  const ratio = input.riskMode <= 100 ? (100 - input.riskMode) / 100 : input.riskMode / 100;
  const targetRevenue = roundMoney(budget * ratio);
  const lockedSpent = roundMoney(Math.min(budget, Math.max(0, input.riskSpent)));
  const lockedRevenue = roundMoney(Math.max(0, input.riskRevenue));
  const lockedImpressions = Math.max(0, Math.trunc(input.riskImpressions));
  const lockedClicks = Math.max(0, Math.trunc(input.riskClicks));
  const remainingBudget = roundMoney(budget - lockedSpent);
  const needed = roundMoney(targetRevenue - lockedRevenue);

  if (remainingBudget <= 0) {
    return economics({
      budget: fraction >= 1 ? budget : spent,
      impressions: lockedImpressions,
      clicks: lockedClicks,
      revenue: lockedRevenue,
      participation: input.participation,
    });
  }

  if (spent <= lockedSpent) {
    const scale = lockedSpent <= 0 ? 0 : Math.min(1, spent / lockedSpent);
    return economics({
      budget: spent,
      impressions: Math.trunc(lockedImpressions * scale),
      clicks: Math.trunc(lockedClicks * scale),
      revenue: roundMoney(lockedRevenue * scale),
      participation: input.participation,
    });
  }

  const tailProgress = fraction >= 1 ? 1 : Math.min(1, (spent - lockedSpent) / remainingBudget);
  const tailImpressions = impressionsFor(remainingBudget, input.cpm);
  const tailClicks = needed <= 0 || input.epc <= 0 ? 0 : Math.round(needed / input.epc);
  const tailRevenue = needed <= 0 || input.epc <= 0 ? 0 : needed;

  if (tailProgress >= 1) {
    return economics({
      budget,
      impressions: lockedImpressions + tailImpressions,
      clicks: lockedClicks + tailClicks,
      revenue: roundMoney(lockedRevenue + tailRevenue),
      participation: input.participation,
    });
  }

  return economics({
    budget: roundMoney(lockedSpent + remainingBudget * tailProgress),
    impressions: lockedImpressions + Math.trunc(tailImpressions * tailProgress),
    clicks: lockedClicks + Math.trunc(tailClicks * tailProgress),
    revenue: roundMoney(lockedRevenue + tailRevenue * tailProgress),
    participation: input.participation,
  });
}
