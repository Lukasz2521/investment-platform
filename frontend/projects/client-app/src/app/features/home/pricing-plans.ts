export interface PricingPlan {
  id: string;
  nameKey: string;
  subtitleKey?: string;
  priceAmount: string;
  priceFrom?: boolean;
  ctaKey: string;
  featureKeys: string[];
  infoFeatureIndexes?: number[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'fundament',
    nameKey: 'marketing.pricingPlans.fundament.name',
    priceAmount: '500',
    ctaKey: 'marketing.pricingPlans.fundament.cta',
    featureKeys: [
      'marketing.pricingPlans.fundament.feature1',
      'marketing.pricingPlans.fundament.feature2',
      'marketing.pricingPlans.fundament.feature3',
      'marketing.pricingPlans.fundament.feature4',
      'marketing.pricingPlans.fundament.feature5',
    ],
    infoFeatureIndexes: [4],
  },
  {
    id: 'akcelerator',
    nameKey: 'marketing.pricingPlans.akcelerator.name',
    priceAmount: '2 500',
    ctaKey: 'marketing.pricingPlans.akcelerator.cta',
    featureKeys: [
      'marketing.pricingPlans.akcelerator.feature1',
      'marketing.pricingPlans.akcelerator.feature2',
      'marketing.pricingPlans.akcelerator.feature3',
      'marketing.pricingPlans.akcelerator.feature4',
      'marketing.pricingPlans.akcelerator.feature5',
      'marketing.pricingPlans.akcelerator.feature6',
    ],
    infoFeatureIndexes: [5],
  },
  {
    id: 'strategia',
    nameKey: 'marketing.pricingPlans.strategia.name',
    priceAmount: '5 000',
    ctaKey: 'marketing.pricingPlans.strategia.cta',
    featureKeys: [
      'marketing.pricingPlans.strategia.feature1',
      'marketing.pricingPlans.strategia.feature2',
      'marketing.pricingPlans.strategia.feature3',
      'marketing.pricingPlans.strategia.feature4',
      'marketing.pricingPlans.strategia.feature5',
      'marketing.pricingPlans.strategia.feature6',
      'marketing.pricingPlans.strategia.feature7',
    ],
    infoFeatureIndexes: [6],
  },
  {
    id: 'alfa',
    nameKey: 'marketing.pricingPlans.alfa.name',
    priceAmount: '10 000',
    ctaKey: 'marketing.pricingPlans.alfa.cta',
    featureKeys: [
      'marketing.pricingPlans.alfa.feature1',
      'marketing.pricingPlans.alfa.feature2',
      'marketing.pricingPlans.alfa.feature3',
      'marketing.pricingPlans.alfa.feature4',
      'marketing.pricingPlans.alfa.feature5',
      'marketing.pricingPlans.alfa.feature6',
      'marketing.pricingPlans.alfa.feature7',
      'marketing.pricingPlans.alfa.feature8',
      'marketing.pricingPlans.alfa.feature9',
    ],
    infoFeatureIndexes: [8],
  },
  {
    id: 'protektor',
    nameKey: 'marketing.pricingPlans.protektor.name',
    priceAmount: '25 000',
    ctaKey: 'marketing.pricingPlans.protektor.cta',
    featureKeys: [
      'marketing.pricingPlans.protektor.feature1',
      'marketing.pricingPlans.protektor.feature2',
      'marketing.pricingPlans.protektor.feature3',
      'marketing.pricingPlans.protektor.feature4',
      'marketing.pricingPlans.protektor.feature5',
      'marketing.pricingPlans.protektor.feature6',
      'marketing.pricingPlans.protektor.feature7',
      'marketing.pricingPlans.protektor.feature8',
      'marketing.pricingPlans.protektor.feature9',
      'marketing.pricingPlans.protektor.feature10',
    ],
    infoFeatureIndexes: [9],
  },
  {
    id: 'dominium',
    nameKey: 'marketing.pricingPlans.dominium.name',
    priceAmount: '50 000',
    ctaKey: 'marketing.pricingPlans.dominium.cta',
    featureKeys: [
      'marketing.pricingPlans.dominium.feature1',
      'marketing.pricingPlans.dominium.feature2',
      'marketing.pricingPlans.dominium.feature3',
      'marketing.pricingPlans.dominium.feature4',
      'marketing.pricingPlans.dominium.feature5',
      'marketing.pricingPlans.dominium.feature6',
      'marketing.pricingPlans.dominium.feature7',
      'marketing.pricingPlans.dominium.feature8',
      'marketing.pricingPlans.dominium.feature9',
      'marketing.pricingPlans.dominium.feature10',
      'marketing.pricingPlans.dominium.feature11',
      'marketing.pricingPlans.dominium.feature12',
    ],
    infoFeatureIndexes: [11],
  },
];
