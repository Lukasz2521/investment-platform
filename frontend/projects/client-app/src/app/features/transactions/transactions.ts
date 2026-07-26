import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TransactionPublic } from '../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../core/transactions/services/transactions.service';
import {
  formatTransactionAmount,
  transactionTypeLabelKey,
} from '../../core/transactions/utils/transaction-display.utils';

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const;
const DEFAULT_CURRENCY = 'PLN';

@Component({
  selector: 'app-transactions',
  imports: [TranslatePipe, DatePipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  private readonly transactionsService = inject(TransactionsService);

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly currency = DEFAULT_CURRENCY;

  protected readonly transactions = signal<TransactionPublic[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly pageSize = signal<number>(PAGE_SIZE_OPTIONS[0]);
  protected readonly pageIndex = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  protected readonly rangeStart = computed(() => {
    if (this.totalCount() === 0) {
      return 0;
    }
    return this.pageIndex() * this.pageSize() + 1;
  });

  protected readonly rangeEnd = computed(() =>
    Math.min((this.pageIndex() + 1) * this.pageSize(), this.totalCount()),
  );

  protected readonly canGoPrevious = computed(() => this.pageIndex() > 0);

  protected readonly canGoNext = computed(
    () => (this.pageIndex() + 1) * this.pageSize() < this.totalCount(),
  );

  ngOnInit(): void {
    this.loadTransactions();
  }

  protected typeLabelKey(type: string): string {
    return transactionTypeLabelKey(type);
  }

  protected formatAmount(amount: string): string {
    return formatTransactionAmount(amount);
  }

  protected onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number])) {
      return;
    }

    this.pageSize.set(value);
    this.pageIndex.set(0);
    this.loadTransactions();
  }

  protected goToPreviousPage(): void {
    if (!this.canGoPrevious()) {
      return;
    }

    this.pageIndex.update((index) => index - 1);
    this.loadTransactions();
  }

  protected goToNextPage(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.pageIndex.update((index) => index + 1);
    this.loadTransactions();
  }

  private loadTransactions(): void {
    this.loading.set(true);
    this.error.set(false);

    const skip = this.pageIndex() * this.pageSize();

    this.transactionsService.getMine(skip, this.pageSize()).subscribe({
      next: (response) => {
        this.transactions.set(response.data);
        this.totalCount.set(response.count);
        this.loading.set(false);
      },
      error: () => {
        this.transactions.set([]);
        this.totalCount.set(0);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
