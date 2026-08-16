export type AccountTypeId =
  | 'fundament'
  | 'akcelerator'
  | 'strategia'
  | 'alfa'
  | 'protektor'
  | 'dominium';

export type AccountType = {
  id: AccountTypeId;
  nameKey: string;
  priceLabel: string;
  profitLabel: string;
  imageUrl: string;
  benefitKeys: string[];
};

export const ACCOUNT_TYPES: AccountType[] = [
  {
    id: 'fundament',
    nameKey: 'app.accountTypes.plans.fundament.name',
    priceLabel: '€500',
    profitLabel: '2,5% netto',
    imageUrl: '/images/account-types/500.jpg',
    benefitKeys: [
      'app.accountTypes.plans.fundament.benefit1',
      'app.accountTypes.plans.fundament.benefit2',
      'app.accountTypes.plans.fundament.benefit3',
      'app.accountTypes.plans.fundament.benefit4',
      'app.accountTypes.plans.fundament.benefit5',
      'app.accountTypes.plans.fundament.benefit6',
    ],
  },
  {
    id: 'akcelerator',
    nameKey: 'app.accountTypes.plans.akcelerator.name',
    priceLabel: '€2 500',
    profitLabel: '3% netto',
    imageUrl: '/images/account-types/2500.jpg',
    benefitKeys: [
      'app.accountTypes.plans.akcelerator.benefit1',
      'app.accountTypes.plans.akcelerator.benefit2',
      'app.accountTypes.plans.akcelerator.benefit3',
      'app.accountTypes.plans.akcelerator.benefit4',
      'app.accountTypes.plans.akcelerator.benefit5',
      'app.accountTypes.plans.akcelerator.benefit6',
    ],
  },
  {
    id: 'strategia',
    nameKey: 'app.accountTypes.plans.strategia.name',
    priceLabel: '€5 000',
    profitLabel: '4% netto',
    imageUrl: '/images/account-types/5000.jpg',
    benefitKeys: [
      'app.accountTypes.plans.strategia.benefit1',
      'app.accountTypes.plans.strategia.benefit2',
      'app.accountTypes.plans.strategia.benefit3',
      'app.accountTypes.plans.strategia.benefit4',
      'app.accountTypes.plans.strategia.benefit5',
      'app.accountTypes.plans.strategia.benefit6',
    ],
  },
  {
    id: 'alfa',
    nameKey: 'app.accountTypes.plans.alfa.name',
    priceLabel: '€10 000',
    profitLabel: '4,5% netto',
    imageUrl: '/images/account-types/10000.jpg',
    benefitKeys: [
      'app.accountTypes.plans.alfa.benefit1',
      'app.accountTypes.plans.alfa.benefit2',
      'app.accountTypes.plans.alfa.benefit3',
      'app.accountTypes.plans.alfa.benefit4',
      'app.accountTypes.plans.alfa.benefit5',
      'app.accountTypes.plans.alfa.benefit6',
      'app.accountTypes.plans.alfa.benefit7',
      'app.accountTypes.plans.alfa.benefit8',
    ],
  },
  {
    id: 'protektor',
    nameKey: 'app.accountTypes.plans.protektor.name',
    priceLabel: '€25 000',
    profitLabel: '5,5% netto',
    imageUrl: '/images/account-types/25000.jpg',
    benefitKeys: [
      'app.accountTypes.plans.protektor.benefit1',
      'app.accountTypes.plans.protektor.benefit2',
      'app.accountTypes.plans.protektor.benefit3',
      'app.accountTypes.plans.protektor.benefit4',
      'app.accountTypes.plans.protektor.benefit5',
      'app.accountTypes.plans.protektor.benefit6',
      'app.accountTypes.plans.protektor.benefit7',
      'app.accountTypes.plans.protektor.benefit8',
      'app.accountTypes.plans.protektor.benefit9',
    ],
  },
  {
    id: 'dominium',
    nameKey: 'app.accountTypes.plans.dominium.name',
    priceLabel: '€50 000',
    profitLabel: '7% netto',
    imageUrl: '/images/account-types/50000.jpg',
    benefitKeys: [
      'app.accountTypes.plans.dominium.benefit1',
      'app.accountTypes.plans.dominium.benefit2',
      'app.accountTypes.plans.dominium.benefit3',
      'app.accountTypes.plans.dominium.benefit4',
      'app.accountTypes.plans.dominium.benefit5',
      'app.accountTypes.plans.dominium.benefit6',
      'app.accountTypes.plans.dominium.benefit7',
      'app.accountTypes.plans.dominium.benefit8',
      'app.accountTypes.plans.dominium.benefit9',
      'app.accountTypes.plans.dominium.benefit10',
    ],
  },
];
