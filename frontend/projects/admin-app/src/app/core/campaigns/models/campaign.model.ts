import { AccountType } from '../../users/models/account-type.model';

export type CampaignStatsPublic = {
  cpm: string;
  epc: string;
  ctr: string;
  calculated_at: string;
};

export type CampaignMetricTickPublic = {
  recorded_on: string;
  recorded_at: string;
  cpm: string;
  epc: string;
  ctr: string;
};

export type CampaignMetricTicksPublic = {
  data: CampaignMetricTickPublic[];
  count: number;
};

export type CampaignPublic = {
  id: string;
  title: string;
  min_days: number;
  days_count: number;
  category_id: string;
  budget: string;
  currency: string;
  cpm_base: string;
  cpm_min: string;
  cpm_max: string;
  epc_min: string;
  epc_max: string;
  ctr_min: string;
  ctr_max: string;
  created_at: string | null;
  location: string[];
  min_account: AccountType;
  image_url: string;
  video_url: string;
  stats: CampaignStatsPublic | null;
};

export type CampaignsPublic = {
  data: CampaignPublic[];
  count: number;
};

export type CampaignWrite = {
  title: string;
  min_days: number;
  days_count: number;
  category_id: string;
  budget: number;
  currency: string;
  cpm_base: number;
  cpm_min: number;
  cpm_max: number;
  epc_min: number;
  epc_max: number;
  ctr_min: number;
  ctr_max: number;
  location: string[];
  min_account: AccountType;
  image_url: string;
  video_url: string;
};

export type CampaignCreate = CampaignWrite;
export type CampaignUpdate = Partial<CampaignWrite>;
