export interface CompanyMember {
  id: string;
  nameKey: string;
  bodyKey: string;
  image: string;
  imageAltKey: string;
}

export const COMPANY_MEMBERS: CompanyMember[] = [
  {
    id: 'jenn',
    nameKey: 'marketing.company.members.jenn.name',
    bodyKey: 'marketing.company.members.jenn.body',
    image: '/images/company/jenn-harper.jpg',
    imageAltKey: 'marketing.company.members.jenn.imageAlt',
  },
  {
    id: 'pierre',
    nameKey: 'marketing.company.members.pierre.name',
    bodyKey: 'marketing.company.members.pierre.body',
    image: '/images/company/pierre.jpg',
    imageAltKey: 'marketing.company.members.pierre.imageAlt',
  },
  {
    id: 'sasha',
    nameKey: 'marketing.company.members.sasha.name',
    bodyKey: 'marketing.company.members.sasha.body',
    image: '/images/company/sasha-velour.jpg',
    imageAltKey: 'marketing.company.members.sasha.imageAlt',
  },
];
