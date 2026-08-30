export type NewsItem = {
  id: string;
  dateKey: string;
  titleKey: string;
  excerptKey: string;
};

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'platform-launch',
    dateKey: 'marketing.news.items.platformLaunch.date',
    titleKey: 'marketing.news.items.platformLaunch.title',
    excerptKey: 'marketing.news.items.platformLaunch.excerpt',
  },
  {
    id: 'new-markets',
    dateKey: 'marketing.news.items.newMarkets.date',
    titleKey: 'marketing.news.items.newMarkets.title',
    excerptKey: 'marketing.news.items.newMarkets.excerpt',
  },
  {
    id: 'partner-network',
    dateKey: 'marketing.news.items.partnerNetwork.date',
    titleKey: 'marketing.news.items.partnerNetwork.title',
    excerptKey: 'marketing.news.items.partnerNetwork.excerpt',
  },
];
