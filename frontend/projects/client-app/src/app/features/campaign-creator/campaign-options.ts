export type CampaignMembershipPlan =
  | 'fundament'
  | 'accelerator'
  | 'strategy'
  | 'alpha'
  | 'protector'
  | 'dominion';

export type CampaignOption = {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string | null;
  days: number;
  minBudget: number;
  currency: string;
  profitMonthly: number;
  epc: number;
  cpm: number;
  ctr: number;
  membershipPlan: CampaignMembershipPlan;
  aiAssistant: boolean;
};
