export interface CompanyFundamental {
  id: string;
  titleKey: string;
  bodyKey: string;
  image: string;
  imageAltKey: string;
}

export const COMPANY_FUNDAMENTALS: CompanyFundamental[] = [
  {
    id: 'quality',
    titleKey: 'marketing.company.fundamentals.quality.title',
    bodyKey: 'marketing.company.fundamentals.quality.body',
    image: '/images/company/quality.jpg',
    imageAltKey: 'marketing.company.fundamentals.quality.imageAlt',
  },
  {
    id: 'culture',
    titleKey: 'marketing.company.fundamentals.culture.title',
    bodyKey: 'marketing.company.fundamentals.culture.body',
    image: '/images/company/culture.jpg',
    imageAltKey: 'marketing.company.fundamentals.culture.imageAlt',
  },
  {
    id: 'innovation',
    titleKey: 'marketing.company.fundamentals.innovation.title',
    bodyKey: 'marketing.company.fundamentals.innovation.body',
    image: '/images/company/innovation.jpg',
    imageAltKey: 'marketing.company.fundamentals.innovation.imageAlt',
  },
];
