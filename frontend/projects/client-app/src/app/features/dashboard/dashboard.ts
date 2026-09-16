import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, forkJoin, interval, of, switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/services/auth.service';
import { UserCampaignsService } from '../../core/campaigns/services/user-campaigns.service';
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
import {
  AccountPublicForUser,
  parseAccountMoney,
} from '../../core/users/models/user-account.model';
import { UsersService } from '../../core/users/services/users.service';
import { DASHBOARD_TILES, DashboardTileId } from './dashboard-tiles';

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 46;
const HISTORY_PAGE_SIZE = 20;
const DASHBOARD_CURRENCY = 'PLN';
const DASHBOARD_POLL_MS = 10_000;

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
      return 'en-US';
  }
}

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss', './dashboard-history.scss'],
})
export class Dashboard implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  private readonly transactionsService = inject(TransactionsService);
  private readonly userCampaignsService = inject(UserCampaignsService);

  protected readonly routes = APP_ROUTE_PATHS;

  protected readonly campaignName = 'Lays';
  protected readonly countdownLabel = signal('');
  protected readonly username = signal('');
  protected readonly account = signal<AccountPublicForUser | null>(null);
  protected readonly realizedProfit = signal(0);

  protected readonly profitSharePercent = computed(() => {
    const participation = this.account()?.participation;
    return typeof participation === 'number' && Number.isFinite(participation)
      ? Math.min(100, Math.max(0, participation))
      : 0;
  });

  protected readonly profitShareLabel = computed(() => {
    this.translationService.activeLanguage();
    return `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(this.profitSharePercent())}%`;
  });

  protected readonly donutDasharray = computed(() => {
    const value = (this.profitSharePercent() / 100) * DONUT_CIRCUMFERENCE;
    return `${value} ${DONUT_CIRCUMFERENCE}`;
  });

  protected readonly tiles = computed(() => {
    this.translationService.activeLanguage();
    const account = this.account();
    const realizedProfit = this.realizedProfit();
    return DASHBOARD_TILES.map((tile) => ({
      id: tile.id,
      titleKey: tile.titleKey,
      value: this.tileValue(tile.id, account, realizedProfit),
    }));
  });

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

    this.loadDashboard(true);
    interval(DASHBOARD_POLL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadDashboard(false));
  }

  protected goToDeposit(): void {
    void this.router.navigate(['/', this.routes.deposit]);
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

  private loadDashboard(showHistoryLoading: boolean): void {
    if (showHistoryLoading) {
      this.historyLoading.set(true);
      this.historyError.set(false);
    }

    this.authService
      .getMe()
      .pipe(
        switchMap((user) => {
          this.username.set(user.username || user.name || user.email);
          return forkJoin({
            accountUser: this.usersService.getById(user.id).pipe(catchError(() => of(null))),
            campaigns: this.userCampaignsService.getAll().pipe(
              catchError(() => of({ data: [], count: 0 })),
            ),
            history: this.transactionsService.getMine(0, HISTORY_PAGE_SIZE).pipe(
              catchError(() => of(null)),
            ),
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ accountUser, campaigns, history }) => {
          this.account.set(accountUser?.account ?? null);
          this.realizedProfit.set(
            campaigns.data
              .filter((enrollment) => enrollment.status === 'completed')
              .reduce((sum, enrollment) => sum + parseAccountMoney(enrollment.net_profit), 0),
          );
          if (history) {
            this.transactions.set(history.data);
            this.transactionsCount.set(history.count);
            this.historyError.set(false);
          } else if (showHistoryLoading) {
            this.transactions.set([]);
            this.transactionsCount.set(0);
            this.historyError.set(true);
          }
          this.historyLoading.set(false);
        },
        error: () => {
          this.username.set('');
          this.account.set(null);
          this.realizedProfit.set(0);
          if (showHistoryLoading) {
            this.transactions.set([]);
            this.transactionsCount.set(0);
            this.historyError.set(true);
          }
          this.historyLoading.set(false);
        },
      });
  }

  private tileValue(
    id: DashboardTileId,
    account: AccountPublicForUser | null,
    realizedProfit: number,
  ): string {
    const available = parseAccountMoney(account?.available_balance);
    const balance = parseAccountMoney(account?.balance);
    const amounts: Record<DashboardTileId, number> = {
      availableBalance: available,
      assetsInCirculation: Math.max(0, balance - available),
      currentProfit: realizedProfit,
      totalDeposits: parseAccountMoney(account?.total_deposit),
      withdrawals: parseAccountMoney(account?.total_withdraw),
      returnsConversion: 0,
    };

    return this.formatMoney(amounts[id]);
  }

  private formatMoney(amount: number): string {
    return new Intl.NumberFormat(localeForLanguage(this.translationService.activeLanguage()), {
      style: 'currency',
      currency: DASHBOARD_CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
