export type PartnershipCategory =
  | 'all'
  | 'charity'
  | 'beauty'
  | 'gaming'
  | 'music'
  | 'digital'
  | 'brands';

export interface PartnershipCategoryOption {
  id: PartnershipCategory;
  labelKey: string;
}

export const PARTNERSHIP_CATEGORIES: PartnershipCategoryOption[] = [
  { id: 'all', labelKey: 'marketing.partnerships.categories.all' },
  { id: 'charity', labelKey: 'marketing.partnerships.categories.charity' },
  { id: 'beauty', labelKey: 'marketing.partnerships.categories.beauty' },
  { id: 'gaming', labelKey: 'marketing.partnerships.categories.gaming' },
  { id: 'music', labelKey: 'marketing.partnerships.categories.music' },
  { id: 'digital', labelKey: 'marketing.partnerships.categories.digital' },
  { id: 'brands', labelKey: 'marketing.partnerships.categories.brands' },
];
