import { estimateCampaignEconomics } from '../../core/campaigns/utils/campaign-economics';
import { MyCampaignStatus } from './my-campaigns-data';

// Test timings. Keep in sync with backend TICK_INTERVAL and USER_CAMPAIGN_DURATION.
// Restore the tick to 30 minutes and set the duration to null before production.
export const USER_CAMPAIGN_TICK_MS = 10_000;
export const USER_CAMPAIGN_TEST_DURATION_MS: number | null = 5 * 60 * 1000;

export type UserCampaignLiveInput = {
  createdAt: string | null;
  endDate: string;
  status: MyCampaignStatus;
  budget: number;
  cpm: number;
  epc: number;
  ctr: number;
  participation: number;
};

export type UserCampaignLiveSnapshot = {
  openedAt: Date | null;
  endsAt: Date | null;
  remainingHours: number;
  remainingMinutes: string;
  usedFunds: number;
  remainingFunds: number;
  impressions: number;
  clicks: number;
  revenue: number;
  grossProfit: number;
  netProfit: number;
  profitPercent: number;
  progressPercent: number;
  status: MyCampaignStatus;
  cpm: number;
  epc: number;
};

type CampaignWindow = {
  openedAt: number;
  endsAt: number;
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function parseTimestamp(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function utcStartOfNextDay(isoDate: string): number | null {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return Date.UTC(year, month - 1, day + 1);
}

export function resolveUserCampaignWindow(
  createdAt: string | null,
  endDate: string,
): CampaignWindow | null {
  if (USER_CAMPAIGN_TEST_DURATION_MS != null) {
    const openedAt = parseTimestamp(createdAt);
    if (openedAt == null) {
      return null;
    }

    return {
      openedAt,
      endsAt: openedAt + USER_CAMPAIGN_TEST_DURATION_MS,
    };
  }

  const endsAt = utcStartOfNextDay(endDate);
  if (endsAt == null) {
    return null;
  }

  return {
    openedAt: parseTimestamp(createdAt) ?? endsAt,
    endsAt,
  };
}

function todayInputValue(now: number): string {
  const today = new Date(now);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isUserCampaignWindowComplete(
  createdAt: string | null,
  endDate: string,
  now = Date.now(),
): boolean {
  const window = resolveUserCampaignWindow(createdAt, endDate);
  if (window) {
    return now >= window.endsAt;
  }

  return endDate < todayInputValue(now);
}

function deliveryFraction(now: number, window: CampaignWindow): number {
  if (now >= window.endsAt) {
    return 1;
  }

  if (now <= window.openedAt) {
    return 0;
  }

  const duration = window.endsAt - window.openedAt;
  const totalTicks = Math.max(1, Math.round(duration / USER_CAMPAIGN_TICK_MS));
  const elapsedTicks = Math.min(totalTicks, Math.floor((now - window.openedAt) / USER_CAMPAIGN_TICK_MS));
  return elapsedTicks / totalTicks;
}

function timeFraction(now: number, window: CampaignWindow): number {
  if (now >= window.endsAt) {
    return 1;
  }

  if (now <= window.openedAt) {
    return 0;
  }

  return (now - window.openedAt) / (window.endsAt - window.openedAt);
}

export function userCampaignLiveSnapshot(
  input: UserCampaignLiveInput,
  now = Date.now(),
): UserCampaignLiveSnapshot {
  const budget = Number.isFinite(input.budget) ? Math.max(0, input.budget) : 0;
  const campaignWindow = resolveUserCampaignWindow(input.createdAt, input.endDate);
  const endedByTime = campaignWindow
    ? now >= campaignWindow.endsAt
    : isUserCampaignWindowComplete(input.createdAt, input.endDate, now);
  const ended = input.status === 'completed' || (input.status !== 'cancelled' && endedByTime);
  const status: MyCampaignStatus =
    input.status === 'cancelled' ? 'cancelled' : ended ? 'completed' : 'active';
  let fraction = 0;
  let progress = 0;
  if (ended) {
    fraction = 1;
    progress = 1;
  } else if (campaignWindow && status === 'active') {
    fraction = deliveryFraction(now, campaignWindow);
    progress = timeFraction(now, campaignWindow);
  }
  const usedFunds = fraction >= 1 ? budget : roundMoney(budget * fraction);
  const rates = {
    cpm: input.cpm,
    epc: input.epc,
    ctr: input.ctr,
    participation: input.participation,
  };
  const economics = estimateCampaignEconomics({ budget: usedFunds, ...rates });
  const fullEconomics = estimateCampaignEconomics({ budget, ...rates });
  const remainingMs =
    campaignWindow && status === 'active' ? Math.max(0, campaignWindow.endsAt - now) : 0;
  const remainingTotalMinutes = Math.floor(remainingMs / 60_000);

  return {
    openedAt: campaignWindow ? new Date(campaignWindow.openedAt) : null,
    endsAt: campaignWindow ? new Date(campaignWindow.endsAt) : null,
    remainingHours: Math.floor(remainingTotalMinutes / 60),
    remainingMinutes: String(remainingTotalMinutes % 60).padStart(2, '0'),
    usedFunds,
    remainingFunds: roundMoney(budget - usedFunds),
    impressions: economics.impressions,
    clicks: economics.clicks,
    revenue: economics.grossRevenue,
    grossProfit: economics.grossProfit,
    netProfit: economics.netProfit,
    profitPercent: fullEconomics.profitPercent,
    progressPercent: Math.round(progress * 100),
    status,
    cpm: input.cpm,
    epc: input.epc,
  };
}
