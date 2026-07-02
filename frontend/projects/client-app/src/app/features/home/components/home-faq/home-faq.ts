import { Component, signal } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { FAQ_ITEMS } from '../../faq-items';

@Component({
  selector: 'app-home-faq',
  imports: [TranslatePipe],
  templateUrl: './home-faq.html',
  styleUrl: './home-faq.scss',
})
export class HomeFaq {
  protected readonly items = FAQ_ITEMS;

  private readonly openIds = signal<ReadonlySet<string>>(new Set());

  protected isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  protected toggle(id: string): void {
    this.openIds.update((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }
}
