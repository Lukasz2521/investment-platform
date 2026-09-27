import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, forkJoin, interval, of, switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/services/auth.service';
import { UserCampaignPublic } from '../../core/campaigns/models/user-campaign.model';
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
import { resolveUserCampaignWindow } from '../my-campaigns/user-campaign-progress';
import { DASHBOARD_TILES, DashboardTileId } from './dashboard-tiles';

type ActiveCampaignDeadline = {
  name: string;
  endsAt: number;
};

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

  protected readonly nearestCampaignName = signal('');
  protected readonly countdownLabel = signal('');
  private readonly activeCampaignDeadlines = signal<ActiveCampaignDeadline[]>([]);
  protected readonly username = signal('');
  protected readonly account = signal<AccountPublicForUser | null>(null);
  protected readonly realizedProfit = signal(0);
  protected readonly assetsInCirculation = signal(0);

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
    const assetsInCirculation = this.assetsInCirculation();
    return DASHBOARD_TILES.map((tile) => ({
      id: tile.id,
      titleKey: tile.titleKey,
      value: this.tileValue(tile.id, account, realizedProfit, assetsInCirculation),
    }));
  });

  protected readonly transactions = signal<TransactionPublic[]>([]);
  protected readonly transactionsCount = signal(0);
  protected readonly historyLoading = signal(true);
  protected readonly historyError = signal(false);

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
          this.assetsInCirculation.set(
            campaigns.data
              .filter((enrollment) => enrollment.status === 'active')
              .reduce((sum, enrollment) => sum + parseAccountMoney(enrollment.budget), 0),
          );
          this.activeCampaignDeadlines.set(activeCampaignDeadlines(campaigns.data));
          this.updateCountdown();
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
          this.assetsInCirculation.set(0);
          this.activeCampaignDeadlines.set([]);
          this.updateCountdown();
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
    assetsInCirculation: number,
  ): string {
    const amounts: Record<DashboardTileId, number> = {
      availableBalance: parseAccountMoney(account?.available_balance),
      assetsInCirculation,
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
    const now = Date.now();
    const nearest = this.activeCampaignDeadlines()
      .filter((campaign) => campaign.endsAt > now)
      .sort((left, right) => left.endsAt - right.endsAt)[0];

    if (!nearest) {
      this.nearestCampaignName.set('');
      this.countdownLabel.set('');
      return;
    }

    this.nearestCampaignName.set(nearest.name);
    const remainingMs = nearest.endsAt - now;
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

function activeCampaignDeadlines(enrollments: UserCampaignPublic[]): ActiveCampaignDeadline[] {
  return enrollments.flatMap((enrollment) => {
    if (enrollment.status !== 'active') {
      return [];
    }

    const window = resolveUserCampaignWindow(enrollment.created_at, enrollment.end_date);
    const name = enrollment.campaign.title.trim();
    if (!window || !name) {
      return [];
    }

    return [{ name, endsAt: window.endsAt }];
  });
}
