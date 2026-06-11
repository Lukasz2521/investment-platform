import { AccountType } from '../../users/models/account-type.model';

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
};

export type CampaignsPublic = {
  data: CampaignPublic[];
  count: number;
};
