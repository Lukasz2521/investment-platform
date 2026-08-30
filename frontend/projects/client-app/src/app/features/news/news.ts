import { Component } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { NEWS_ITEMS } from './news-items';

@Component({
  selector: 'app-news',
  imports: [TranslatePipe],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class News {
  protected readonly items = NEWS_ITEMS;
}
