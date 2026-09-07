export type CampaignStatsPublic = {
  cpm: string;
  epc: string;
  ctr: string;
  calculated_at: string;
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
  min_account: string;
  image_url: string;
  video_url: string;
  stats: CampaignStatsPublic | null;
};

export type CampaignsPublic = {
  data: CampaignPublic[];
  count: number;
};
