import { MarketCampaign, MARKET_CAMPAIGNS } from '../markets/market-campaigns';

export type MyCampaignStatus = 'active' | 'cancelled' | 'completed';

export type MyCampaign = MarketCampaign & {
  status: MyCampaignStatus;
};

export type MyCampaignTab = {
  id: MyCampaignStatus;
  labelKey: string;
};

export const MY_CAMPAIGN_TABS: MyCampaignTab[] = [
  { id: 'active', labelKey: 'app.myCampaigns.tabs.active' },
  { id: 'cancelled', labelKey: 'app.myCampaigns.tabs.cancelled' },
  { id: 'completed', labelKey: 'app.myCampaigns.tabs.completed' },
];

const STATUS_BY_ID: Record<string, MyCampaignStatus> = {
  'nba-2025-26': 'active',
  'mlb-2026': 'active',
  'esports-masters': 'active',
  'winter-cup': 'active',
  'atp-tour': 'cancelled',
  'hogwarts-arena': 'cancelled',
  'f1-2026': 'completed',
  'uefa-nations': 'completed',
  'callisto-protocol': 'completed',
  'olympics-spotlight': 'completed',
};

export const MY_CAMPAIGNS: MyCampaign[] = MARKET_CAMPAIGNS.filter(
  (campaign) => STATUS_BY_ID[campaign.id],
).map((campaign) => ({
  ...campaign,
  status: STATUS_BY_ID[campaign.id],
}));

export function getMyCampaignsByStatus(
  status: MyCampaignStatus,
  campaigns: readonly MyCampaign[] = MY_CAMPAIGNS,
): MyCampaign[] {
  return campaigns.filter((campaign) => campaign.status === status);
}

export function getMyCampaign(id: string): MyCampaign | undefined {
  return MY_CAMPAIGNS.find((campaign) => campaign.id === id);
}
