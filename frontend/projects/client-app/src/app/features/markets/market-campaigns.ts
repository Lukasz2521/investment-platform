import { CampaignMembershipPlan, CampaignOption } from '../campaign-creator/campaign-options';

export type MarketCategoryId = 'sports' | 'gaming' | 'lifestyle' | 'finance';

export type MarketCategory = {
  id: MarketCategoryId;
  labelKey: string;
};

export type MarketCampaign = CampaignOption & {
  categoryId: MarketCategoryId;
  companyDescriptionKey: string;
  countryCodes: string[];
};

export const MARKET_CATEGORIES: MarketCategory[] = [
  { id: 'sports', labelKey: 'app.markets.categories.sports' },
  { id: 'gaming', labelKey: 'app.markets.categories.gaming' },
  { id: 'lifestyle', labelKey: 'app.markets.categories.lifestyle' },
  { id: 'finance', labelKey: 'app.markets.categories.finance' },
];

export const MARKET_CAMPAIGNS: MarketCampaign[] = [
  // Sports — 7 items (scroll test, > 4)
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
    membershipPlan: 'strategy' satisfies CampaignMembershipPlan,
    aiAssistant: true,
    companyDescriptionKey: 'app.markets.campaigns.nba-2025-26.description',
    countryCodes: ['us', 'ca', 'gb', 'de'],
    categoryId: 'sports',
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
    companyDescriptionKey: 'app.markets.campaigns.mlb-2026.description',
    countryCodes: ['us', 'mx', 'ca', 'jp'],
    categoryId: 'sports',
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
    companyDescriptionKey: 'app.markets.campaigns.atp-tour.description',
    countryCodes: ['fr', 'es', 'it', 'gb', 'us'],
    categoryId: 'sports',
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
    companyDescriptionKey: 'app.markets.campaigns.f1-2026.description',
    countryCodes: ['it', 'mc', 'gb', 'us', 'jp', 'ae'],
    categoryId: 'sports',
  },
  {
    id: 'uefa-nations',
    title: 'UEFA Nations',
    imageUrl: '/images/partnerships/experiential.jpg',
    days: 35,
    minBudget: 6400,
    currency: 'EUR',
    profitMonthly: 9.05,
    epc: 0.19,
    cpm: 2.75,
    ctr: 1.78,
    membershipPlan: 'strategy',
    aiAssistant: true,
    companyDescriptionKey: 'app.markets.campaigns.uefa-nations.description',
    countryCodes: ['de', 'fr', 'es', 'pl', 'nl', 'pt'],
    categoryId: 'sports',
  },
  {
    id: 'olympics-spotlight',
    title: 'Olympics Spotlight',
    imageUrl: '/images/partnerships/hero.jpg',
    days: 40,
    minBudget: 9100,
    currency: 'EUR',
    profitMonthly: 8.4,
    epc: 0.21,
    cpm: 3.05,
    ctr: 1.55,
    membershipPlan: 'alpha',
    aiAssistant: false,
    companyDescriptionKey: 'app.markets.campaigns.olympics-spotlight.description',
    countryCodes: ['fr', 'us', 'jp', 'au', 'br'],
    categoryId: 'sports',
  },
  {
    id: 'winter-cup',
    title: 'Winter Cup',
    imageUrl: '/images/partnerships/rona.jpg',
    days: 24,
    minBudget: 4800,
    currency: 'EUR',
    profitMonthly: 10.8,
    epc: 0.23,
    cpm: 2.9,
    ctr: 2.05,
    membershipPlan: 'accelerator',
    aiAssistant: true,
    companyDescriptionKey: 'app.markets.campaigns.winter-cup.description',
    countryCodes: ['no', 'se', 'fi', 'ch', 'at'],
    categoryId: 'sports',
  },

  // Gaming — exactly 3 items
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
    companyDescriptionKey: 'app.markets.campaigns.esports-masters.description',
    countryCodes: ['kr', 'us', 'pl', 'de', 'br'],
    categoryId: 'gaming',
  },
  {
    id: 'hogwarts-arena',
    title: 'Hogwarts Arena',
    imageUrl: '/images/partnerships/hogwarts.jpg',
    days: 28,
    minBudget: 3900,
    currency: 'EUR',
    profitMonthly: 10.4,
    epc: 0.18,
    cpm: 2.6,
    ctr: 1.92,
    membershipPlan: 'strategy',
    aiAssistant: true,
    companyDescriptionKey: 'app.markets.campaigns.hogwarts-arena.description',
    countryCodes: ['gb', 'us', 'de', 'fr'],
    categoryId: 'gaming',
  },
  {
    id: 'callisto-protocol',
    title: 'Callisto Protocol',
    imageUrl: '/images/partnerships/callisto.jpg',
    days: 18,
    minBudget: 3550,
    currency: 'EUR',
    profitMonthly: 12.1,
    epc: 0.2,
    cpm: 2.35,
    ctr: 2.25,
    membershipPlan: 'accelerator',
    aiAssistant: false,
    companyDescriptionKey: 'app.markets.campaigns.callisto-protocol.description',
    countryCodes: ['us', 'gb', 'de', 'jp'],
    categoryId: 'gaming',
  },

  // Lifestyle — empty
  // Finance — empty
];

export type MarketCategorySection = MarketCategory & {
  campaigns: MarketCampaign[];
};

export function getMarketCategorySections(
  campaigns: readonly MarketCampaign[] = MARKET_CAMPAIGNS,
  categories: readonly MarketCategory[] = MARKET_CATEGORIES,
): MarketCategorySection[] {
  return categories
    .map((category) => ({
      ...category,
      campaigns: campaigns.filter((campaign) => campaign.categoryId === category.id),
    }))
    .filter((section) => section.campaigns.length > 0);
}

export function getMarketCampaign(id: string): MarketCampaign | undefined {
  return MARKET_CAMPAIGNS.find((campaign) => campaign.id === id);
}

export function getMarketCategoryLabelKey(categoryId: MarketCategoryId): string {
  return (
    MARKET_CATEGORIES.find((category) => category.id === categoryId)?.labelKey ??
    'app.markets.categories.sports'
  );
}
