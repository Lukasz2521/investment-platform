import { Component, computed, signal } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { ACCOUNT_TYPES } from './account-types-data';

@Component({
  selector: 'app-account-types',
  imports: [TranslatePipe],
  templateUrl: './account-types.html',
  styleUrl: './account-types.scss',
})
export class AccountTypes {
  protected readonly plans = ACCOUNT_TYPES;
  protected readonly activeIndex = signal(0);

  protected readonly activePlan = computed(() => this.plans[this.activeIndex()]);

  protected readonly canGoPrev = computed(() => this.activeIndex() > 0);
  protected readonly canGoNext = computed(() => this.activeIndex() < this.plans.length - 1);

  protected goPrev(): void {
    if (!this.canGoPrev()) {
      return;
    }

    this.activeIndex.update((index) => index - 1);
  }

  protected goNext(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.activeIndex.update((index) => index + 1);
  }

  protected goTo(index: number): void {
    if (index < 0 || index >= this.plans.length) {
      return;
    }

    this.activeIndex.set(index);
  }
}
