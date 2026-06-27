import { Component } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  imports: [TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly heroPhrases = [
    'marketing.hero.phrase1',
    'marketing.hero.phrase2',
    'marketing.hero.phrase3',
    'marketing.hero.phrase4',
    'marketing.hero.phrase5',
    'marketing.hero.phrase6',
    'marketing.hero.phrase7',
  ];

  protected readonly storeShowcases = [
    { name: 'stevemadden.com', tone: 'tone-1', labelKey: 'marketing.stores.stevemadden' },
    { name: 'ornotbike.com', tone: 'tone-2', labelKey: 'marketing.stores.ornot' },
    { name: 'glossier.com', tone: 'tone-3', labelKey: 'marketing.stores.glossier' },
    { name: 'houseplant.com', tone: 'tone-4', labelKey: '' },
    { name: 'kotn.com', tone: 'tone-5', labelKey: '' },
    { name: 'eastfork.com', tone: 'tone-6', labelKey: '' },
    { name: 'monos.com', tone: 'tone-7', labelKey: '' },
    { name: 'stanley1913.com', tone: 'tone-8', labelKey: '' },
    { name: 'shopyowie.com', tone: 'tone-9', labelKey: '' },
    { name: 'ftcsf.com', tone: 'tone-10', labelKey: '' },
    { name: 'onlyny.com', tone: 'tone-11', labelKey: '' },
    { name: 'jp.bonaventura.shop', tone: 'tone-12', labelKey: '' },
  ];

  protected readonly growthStories = [
    {
      titleKey: 'marketing.growth.story1.title',
      bodyKey: 'marketing.growth.story1.body',
    },
    {
      titleKey: 'marketing.growth.story2.title',
      bodyKey: 'marketing.growth.story2.body',
    },
    {
      titleKey: 'marketing.growth.story3.title',
      bodyKey: 'marketing.growth.story3.body',
    },
  ];

  protected readonly capitalStats = [
    {
      valueKey: 'marketing.capital.stat1.value',
      labelKey: 'marketing.capital.stat1.label',
    },
    {
      valueKey: 'marketing.capital.stat2.value',
      labelKey: 'marketing.capital.stat2.label',
    },
    {
      valueKey: 'marketing.capital.stat3.value',
      labelKey: 'marketing.capital.stat3.label',
    },
  ];

  protected readonly buildSteps = [
    'marketing.build.step1',
    'marketing.build.step2',
    'marketing.build.step3',
  ];
}
