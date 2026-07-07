import { PartnershipCategory } from './partnership-categories';

export interface PartnershipProject {
  id: string;
  category: Exclude<PartnershipCategory, 'all'>;
  clientKey: string;
  titleKey: string;
  image: string;
  imageAltKey: string;
}

export const PARTNERSHIP_PROJECTS: PartnershipProject[] = [
  {
    id: 'cheekbone',
    category: 'beauty',
    clientKey: 'marketing.partnerships.projects.cheekbone.client',
    titleKey: 'marketing.partnerships.projects.cheekbone.title',
    image: '/images/partnerships/cheekbone.jpg',
    imageAltKey: 'marketing.partnerships.projects.cheekbone.imageAlt',
  },
  {
    id: 'bimber',
    category: 'music',
    clientKey: 'marketing.partnerships.projects.bimber.client',
    titleKey: 'marketing.partnerships.projects.bimber.title',
    image: '/images/partnerships/bimber.jpg',
    imageAltKey: 'marketing.partnerships.projects.bimber.imageAlt',
  },
  {
    id: 'youth-foundation',
    category: 'charity',
    clientKey: 'marketing.partnerships.projects.youthFoundation.client',
    titleKey: 'marketing.partnerships.projects.youthFoundation.title',
    image: '/images/partnerships/charity.jpg',
    imageAltKey: 'marketing.partnerships.projects.youthFoundation.imageAlt',
  },
  {
    id: 'callisto',
    category: 'gaming',
    clientKey: 'marketing.partnerships.projects.callisto.client',
    titleKey: 'marketing.partnerships.projects.callisto.title',
    image: '/images/partnerships/gaming.jpg',
    imageAltKey: 'marketing.partnerships.projects.callisto.imageAlt',
  },
  {
    id: 'hogwarts',
    category: 'gaming',
    clientKey: 'marketing.partnerships.projects.hogwarts.client',
    titleKey: 'marketing.partnerships.projects.hogwarts.title',
    image: '/images/partnerships/hogwarts.jpg',
    imageAltKey: 'marketing.partnerships.projects.hogwarts.imageAlt',
  },
  {
    id: 'linkbuds',
    category: 'brands',
    clientKey: 'marketing.partnerships.projects.linkbuds.client',
    titleKey: 'marketing.partnerships.projects.linkbuds.title',
    image: '/images/partnerships/linkbuds.jpg',
    imageAltKey: 'marketing.partnerships.projects.linkbuds.imageAlt',
  },
  {
    id: 'loto',
    category: 'digital',
    clientKey: 'marketing.partnerships.projects.loto.client',
    titleKey: 'marketing.partnerships.projects.loto.title',
    image: '/images/partnerships/digital-app.jpg',
    imageAltKey: 'marketing.partnerships.projects.loto.imageAlt',
  },
  {
    id: 'canadiens',
    category: 'brands',
    clientKey: 'marketing.partnerships.projects.canadiens.client',
    titleKey: 'marketing.partnerships.projects.canadiens.title',
    image: '/images/partnerships/sports.jpg',
    imageAltKey: 'marketing.partnerships.projects.canadiens.imageAlt',
  },
  {
    id: 'drag-creative',
    category: 'charity',
    clientKey: 'marketing.partnerships.projects.dragCreative.client',
    titleKey: 'marketing.partnerships.projects.dragCreative.title',
    image: '/images/partnerships/creative.jpg',
    imageAltKey: 'marketing.partnerships.projects.dragCreative.imageAlt',
  },
  {
    id: 'resorts-world',
    category: 'digital',
    clientKey: 'marketing.partnerships.projects.resortsWorld.client',
    titleKey: 'marketing.partnerships.projects.resortsWorld.title',
    image: '/images/partnerships/experiential.jpg',
    imageAltKey: 'marketing.partnerships.projects.resortsWorld.imageAlt',
  },
];
