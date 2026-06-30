export interface HowItWorksStep {
  id: string;
  titleKey: string;
  bodyKey: string;
  extraBodyKey?: string;
  image: string;
  imageAltKey: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: 'partnerships',
    titleKey: 'marketing.howItWorks.step1.title',
    bodyKey: 'marketing.howItWorks.step1.body',
    image: '/images/how-it-works/step-1-partnerships.jpg',
    imageAltKey: 'marketing.howItWorks.step1.imageAlt',
  },
  {
    id: 'campaigns',
    titleKey: 'marketing.howItWorks.step2.title',
    bodyKey: 'marketing.howItWorks.step2.body',
    image: '/images/how-it-works/step-2-campaigns.jpg',
    imageAltKey: 'marketing.howItWorks.step2.imageAlt',
  },
  {
    id: 'scaling',
    titleKey: 'marketing.howItWorks.step3.title',
    bodyKey: 'marketing.howItWorks.step3.body',
    image: '/images/how-it-works/step-3-scaling.jpg',
    imageAltKey: 'marketing.howItWorks.step3.imageAlt',
  },
  {
    id: 'traffic',
    titleKey: 'marketing.howItWorks.step4.title',
    bodyKey: 'marketing.howItWorks.step4.body',
    image: '/images/how-it-works/step-4-traffic.jpg',
    imageAltKey: 'marketing.howItWorks.step4.imageAlt',
  },
  {
    id: 'optimization',
    titleKey: 'marketing.howItWorks.step5.title',
    bodyKey: 'marketing.howItWorks.step5.body',
    extraBodyKey: 'marketing.howItWorks.step5.extra',
    image: '/images/how-it-works/step-5-optimization.jpg',
    imageAltKey: 'marketing.howItWorks.step5.imageAlt',
  },
  {
    id: 'billing',
    titleKey: 'marketing.howItWorks.step6.title',
    bodyKey: 'marketing.howItWorks.step6.body',
    image: '/images/how-it-works/step-6-results.jpg',
    imageAltKey: 'marketing.howItWorks.step6.imageAlt',
  },
];
