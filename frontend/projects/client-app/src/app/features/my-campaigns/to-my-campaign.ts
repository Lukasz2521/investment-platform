import { UserCampaignPublic, UserCampaignStatus } from '../../core/campaigns/models/user-campaign.model';
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
  const market = toMarketCampaign(enrollment.campaign, categoryName);
  const days =
    campaignGuidelinesDurationDays(enrollment.start_date, enrollment.end_date) ?? market.days;

  return {
    ...market,
    id: enrollment.id,
    days,
    minBudget: Number(enrollment.budget),
    status: resolveStatus(enrollment.status, enrollment.end_date, enrollment.created_at),
    startDate: enrollment.start_date,
    endDate: enrollment.end_date,
  };
}
