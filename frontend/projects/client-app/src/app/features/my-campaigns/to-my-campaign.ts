import { UserCampaignPublic, UserCampaignStatus } from '../../core/campaigns/models/user-campaign.model';
import { estimateCampaignEconomics } from '../../core/campaigns/utils/campaign-economics';
import { campaignGuidelinesDurationDays } from '../campaign-creator/campaign-guidelines';
import { toMarketCampaign } from '../markets/to-market-campaign';
import { MyCampaign, MyCampaignStatus } from './my-campaigns-data';

function todayInputValue(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const USER_CAMPAIGN_TEST_DURATION_MS = 5 * 60 * 1000;

function resolveStatus(
  status: UserCampaignStatus,
  endDate: string,
  createdAt: string | null,
): MyCampaignStatus {
  if (status === 'cancelled') {
    return 'cancelled';
  }

  if (status === 'completed') {
    return 'completed';
  }

  if (createdAt) {
    const startedAt = new Date(createdAt).getTime();
    if (Number.isFinite(startedAt) && Date.now() >= startedAt + USER_CAMPAIGN_TEST_DURATION_MS) {
      return 'completed';
    }
  }

  if (endDate < todayInputValue()) {
    return 'completed';
  }

  return 'active';
}

export function toMyCampaign(enrollment: UserCampaignPublic, categoryName: string): MyCampaign {
  const market = toMarketCampaign(
    enrollment.campaign,
    categoryName,
    enrollment.participation,
  );
  const days =
    campaignGuidelinesDurationDays(enrollment.start_date, enrollment.end_date) ?? market.days;
  const budget = Number(enrollment.budget);
  const cpm = Number(enrollment.cpm);
  const epc = Number(enrollment.epc);
  const ctr = Number(enrollment.ctr);
  const economics = estimateCampaignEconomics({
    budget: Number.isFinite(budget) ? budget : market.minBudget,
    cpm: Number.isFinite(cpm) ? cpm : market.cpm,
    epc: Number.isFinite(epc) ? epc : market.epc,
    ctr: Number.isFinite(ctr) ? ctr : market.ctr,
    participation: enrollment.participation,
  });

  return {
    ...market,
    id: enrollment.id,
    days,
    minBudget: Number.isFinite(budget) ? budget : market.minBudget,
    epc: Number.isFinite(epc) ? epc : market.epc,
    cpm: Number.isFinite(cpm) ? cpm : market.cpm,
    ctr: Number.isFinite(ctr) ? ctr : market.ctr,
    profitMonthly: economics.netProfitPercent,
    status: resolveStatus(enrollment.status, enrollment.end_date, enrollment.created_at),
    startDate: enrollment.start_date,
    endDate: enrollment.end_date,
    impressions: enrollment.impressions ?? economics.impressions,
    clicks: enrollment.clicks ?? economics.clicks,
    grossRevenue: Number(enrollment.gross_revenue) || economics.grossRevenue,
    grossProfit: Number(enrollment.gross_profit) || economics.grossProfit,
    netProfit: Number(enrollment.net_profit) || economics.netProfit,
    participation: enrollment.participation,
  };
}
