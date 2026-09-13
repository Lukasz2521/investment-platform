import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { NewsPublic } from '../../core/news/models/news.model';
import { NewsService } from '../../core/news/services/news.service';

function localeForLanguage(language: string): string {
  switch (language) {
    case 'pl':
      return 'pl-PL';
    case 'de':
      return 'de-DE';
    case 'fr':
      return 'fr-FR';
    case 'pt':
      return 'pt-PT';
    case 'ru':
      return 'ru-RU';
    default:
      return 'en-GB';
  }
}

function formatPublishedDate(value: string, locale: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

type NewsListItem = NewsPublic & { publishedLabel: string };

@Component({
  selector: 'app-news',
  imports: [TranslatePipe],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  private readonly newsService = inject(NewsService);
  private readonly translationService = inject(TranslationService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly newsItems = signal<NewsPublic[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly items = computed<NewsListItem[]>(() => {
    const locale = localeForLanguage(this.translationService.activeLanguage());
    return this.newsItems().map((item) => ({
      ...item,
      publishedLabel: formatPublishedDate(item.published_at, locale),
    }));
  });

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadNews();
    });
  }

  private loadNews(): void {
    this.loading.set(true);
    this.error.set(false);

    this.newsService.getAll().subscribe({
      next: ({ data }) => {
        this.newsItems.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.newsItems.set([]);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
