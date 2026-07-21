import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { interval } from 'rxjs';

import { AuthService } from '../../core/auth/services/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { TransactionPublic } from '../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../core/transactions/services/transactions.service';
import {
  formatTransactionAmount,
  isOutgoingTransaction,
  transactionStatusLabelKey,
  transactionTypeLabelKey,
} from '../../core/transactions/utils/transaction-display.utils';
import { DASHBOARD_TILES } from './dashboard-tiles';

const PROFIT_SHARE_PERCENT = 49;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * 46;
const HISTORY_PAGE_SIZE = 20;

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly transactionsService = inject(TransactionsService);

  protected readonly routes = APP_ROUTE_PATHS;

  protected readonly tiles = DASHBOARD_TILES;
  protected readonly campaignName = 'Lays';
  protected readonly profitSharePercent = PROFIT_SHARE_PERCENT;
  protected readonly donutDasharray = `${(PROFIT_SHARE_PERCENT / 100) * DONUT_CIRCUMFERENCE} ${DONUT_CIRCUMFERENCE}`;
  protected readonly countdownLabel = signal('');
  protected readonly username = signal('');

  protected readonly transactions = signal<TransactionPublic[]>([]);
  protected readonly transactionsCount = signal(0);
  protected readonly historyLoading = signal(true);
  protected readonly historyError = signal(false);

  private readonly campaignEndsAt = Date.now() + ((10 * 24 + 14) * 60 * 60 + 10 * 60 + 33) * 1000;

  ngOnInit(): void {
    this.updateCountdown();
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateCountdown());

    this.loadUser();
    this.loadHistory();
  }

  protected goToDeposit(): void {
    void this.router.navigate(['/', this.routes.deposit]);
  }

  private loadUser(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.username.set(user.username || user.name || user.email);
      },
      error: () => {
        this.username.set('');
      },
    });
  }

  protected formatAmount(amount: string): string {
    return formatTransactionAmount(amount);
  }

  protected typeLabelKey(type: string): string {
    return transactionTypeLabelKey(type);
  }

  protected statusLabelKey(status: string): string {
    return transactionStatusLabelKey(status);
  }

  protected amountPrefix(transaction: TransactionPublic): string {
    return isOutgoingTransaction(transaction) ? '−' : '+';
  }

  protected isOutgoing(transaction: TransactionPublic): boolean {
    return isOutgoingTransaction(transaction);
  }

  private loadHistory(): void {
    this.historyLoading.set(true);
    this.historyError.set(false);

    this.transactionsService.getMine(0, HISTORY_PAGE_SIZE).subscribe({
      next: (response) => {
        this.transactions.set(response.data);
        this.transactionsCount.set(response.count);
        this.historyLoading.set(false);
      },
      error: () => {
        this.transactions.set([]);
        this.transactionsCount.set(0);
        this.historyLoading.set(false);
        this.historyError.set(true);
      },
    });
  }

  private updateCountdown(): void {
    const remainingMs = Math.max(0, this.campaignEndsAt - Date.now());
    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.countdownLabel.set(
      this.translationService.translate('app.dashboard.profitShare.countdown', {
        days: String(days),
        hours: String(hours),
        minutes: String(minutes),
        seconds: String(seconds),
      }),
    );
  }
}
