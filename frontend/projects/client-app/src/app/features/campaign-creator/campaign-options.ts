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

export const CAMPAIGN_OPTIONS: CampaignOption[] = [
  {
    id: 'nba-2025-26',
    title: 'NBA 2025/26',
    imageUrl: '/images/partnerships/sports.jpg',
    days: 30,
    minBudget: 7006,
    currency: 'EUR',
    profitMonthly: 8.72,
    epc: 0.18,
    cpm: 2.86,
    ctr: 1.71,
    membershipPlan: 'strategy',
    aiAssistant: true,
  },
  {
    id: 'mlb-2026',
    title: 'MLB 2026',
    imageUrl: '/images/partnerships/canadiens.jpg',
    days: 30,
    minBudget: 5531,
    currency: 'EUR',
    profitMonthly: 10.31,
    epc: 0.22,
    cpm: 3.12,
    ctr: 1.95,
    membershipPlan: 'strategy',
    aiAssistant: true,
  },
  {
    id: 'atp-tour',
    title: 'ATP Tour',
    imageUrl: '/images/partnerships/iga-avatars.jpg',
    days: 30,
    minBudget: 6306,
    currency: 'EUR',
    profitMonthly: 10.25,
    epc: 0.2,
    cpm: 2.95,
    ctr: 1.84,
    membershipPlan: 'strategy',
    aiAssistant: true,
  },
  {
    id: 'f1-2026',
    title: 'F1 2026',
    imageUrl: '/images/partnerships/gilles-villeneuve.jpg',
    days: 45,
    minBudget: 8200,
    currency: 'EUR',
    profitMonthly: 9.48,
    epc: 0.25,
    cpm: 3.4,
    ctr: 1.62,
    membershipPlan: 'alpha',
    aiAssistant: true,
  },
  {
    id: 'esports-masters',
    title: 'Esports Masters',
    imageUrl: '/images/partnerships/gaming.jpg',
    days: 21,
    minBudget: 4125,
    currency: 'EUR',
    profitMonthly: 11.05,
    epc: 0.16,
    cpm: 2.45,
    ctr: 2.1,
    membershipPlan: 'accelerator',
    aiAssistant: true,
  },
  {
    id: 'resort-open',
    title: 'Resort Open',
    imageUrl: '/images/partnerships/resorts-world.png',
    days: 30,
    minBudget: 5890,
    currency: 'EUR',
    profitMonthly: 7.9,
    epc: 0.14,
    cpm: 2.2,
    ctr: 1.45,
    membershipPlan: 'strategy',
    aiAssistant: false,
  },
];
