export type PartnershipCategory =
  | 'all'
  | 'brandedContent'
  | 'eventsActivations'
  | 'advertising'
  | 'interiorRetail'
  | 'experiential'
  | 'digital'
  | 'architecture'
  | 'designBranding';

export interface PartnershipCategoryOption {
  id: PartnershipCategory;
  labelKey: string;
}

export const PARTNERSHIP_CATEGORIES: PartnershipCategoryOption[] = [
  { id: 'all', labelKey: 'marketing.partnerships.categories.all' },
  { id: 'brandedContent', labelKey: 'marketing.partnerships.categories.brandedContent' },
  { id: 'eventsActivations', labelKey: 'marketing.partnerships.categories.eventsActivations' },
  { id: 'advertising', labelKey: 'marketing.partnerships.categories.advertising' },
  { id: 'interiorRetail', labelKey: 'marketing.partnerships.categories.interiorRetail' },
  { id: 'experiential', labelKey: 'marketing.partnerships.categories.experiential' },
  { id: 'digital', labelKey: 'marketing.partnerships.categories.digital' },
  { id: 'architecture', labelKey: 'marketing.partnerships.categories.architecture' },
  { id: 'designBranding', labelKey: 'marketing.partnerships.categories.designBranding' },
];
