import { Component } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';

type SmartMarketingItem = {
  id: string;
  imageSrc: string;
  imageAltKey: string;
  titleKey: string;
  bodyKey: string;
};

@Component({
  selector: 'app-home-smart-marketing',
  imports: [TranslatePipe],
  templateUrl: './home-smart-marketing.html',
  styleUrl: './home-smart-marketing.scss',
})
export class HomeSmartMarketing {
  protected readonly items: SmartMarketingItem[] = [
    {
      id: 'profit',
      imageSrc: '/images/home/smart-marketing/config.jpg',
      imageAltKey: 'marketing.smartMarketing.items.profit.imageAlt',
      titleKey: 'marketing.smartMarketing.items.profit.title',
      bodyKey: 'marketing.smartMarketing.items.profit.body',
    },
    {
      id: 'ai',
      imageSrc: '/images/home/smart-marketing/campaign.jpg',
      imageAltKey: 'marketing.smartMarketing.items.ai.imageAlt',
      titleKey: 'marketing.smartMarketing.items.ai.title',
      bodyKey: 'marketing.smartMarketing.items.ai.body',
    },
    {
      id: 'sync',
      imageSrc: '/images/home/smart-marketing/sync.jpg',
      imageAltKey: 'marketing.smartMarketing.items.sync.imageAlt',
      titleKey: 'marketing.smartMarketing.items.sync.title',
      bodyKey: 'marketing.smartMarketing.items.sync.body',
    },
  ];
}
