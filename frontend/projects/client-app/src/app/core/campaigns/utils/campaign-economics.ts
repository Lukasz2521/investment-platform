export type CampaignEconomicsInput = {
  budget: number;
  cpm: number;
  epc: number;
  ctr: number;
  participation: number;
};

export type CampaignEconomics = {
  impressions: number;
  clicks: number;
  grossRevenue: number;
  grossProfit: number;
  netProfit: number;
  payout: number;
  profitPercent: number;
  netProfitPercent: number;
};

const ZERO_ECONOMICS: CampaignEconomics = {
  impressions: 0,
  clicks: 0,
  grossRevenue: 0,
  grossProfit: 0,
  netProfit: 0,
  payout: 0,
  profitPercent: 0,
  netProfitPercent: 0,
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function estimateCampaignEconomics(
  input: CampaignEconomicsInput,
): CampaignEconomics {
  const budget = Number(input.budget);
  const cpm = Number(input.cpm);
  const epc = Number(input.epc);
  const ctr = Number(input.ctr);
  const participation = Math.min(100, Math.max(0, Math.round(Number(input.participation) || 0)));

  if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(cpm) || cpm <= 0) {
    return { ...ZERO_ECONOMICS, payout: Number.isFinite(budget) && budget > 0 ? roundMoney(budget) : 0 };
  }

  const packages = roundMoney(budget / cpm);
  const impressions = Math.trunc(packages * 1000);
  const clicks = Math.trunc(impressions * (ctr / 100));
  const grossRevenue = roundMoney(clicks * epc);
  const grossProfit = roundMoney(grossRevenue - budget);
  const netProfit = roundMoney(Math.max(0, grossProfit) * (participation / 100));
  const payout = roundMoney(budget + netProfit);

  return {
    impressions,
    clicks,
    grossRevenue,
    grossProfit,
    netProfit,
    payout,
    profitPercent: roundMoney((grossProfit / budget) * 100),
    netProfitPercent: roundMoney((netProfit / budget) * 100),
  };
}
