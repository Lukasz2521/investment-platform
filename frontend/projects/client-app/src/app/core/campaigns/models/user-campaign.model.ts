import { CampaignPublic } from './campaign.model';

export type UserCampaignStatus = 'active' | 'cancelled' | 'completed';

export type UserCampaignPublic = {
  id: string;
  user_id: string;
  campaign_id: string;
  start_date: string;
  end_date: string;
  budget: string;
  cpm: string;
  epc: string;
  ctr: string;
  participation: number;
  impressions: number;
  clicks: number;
  gross_revenue: string;
  gross_profit: string;
  net_profit: string;
  status: UserCampaignStatus;
  created_at: string | null;
  settled_at: string | null;
  campaign: CampaignPublic;
};

export type UserCampaignsPublic = {
  data: UserCampaignPublic[];
  count: number;
};

export type UserCampaignCreate = {
  campaign_id: string;
  start_date: string;
  end_date: string;
  budget: number;
};
