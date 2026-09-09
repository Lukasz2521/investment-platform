import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, Subscription, switchMap } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { CampaignsService } from '../../../core/campaigns/services/campaigns.service';
import { CategoriesService } from '../../../core/campaigns/services/categories.service';
import { UserCampaignsService } from '../../../core/campaigns/services/user-campaigns.service';
import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../../core/routing/app-route-paths';
import {
  parseAccountMoney,
  UserPublicWithAccount,
} from '../../../core/users/models/user-account.model';
import { UsersService } from '../../../core/users/services/users.service';
import {
  addDaysToDateInput,
  campaignGuidelinesDurationDays,
} from '../../campaign-creator/campaign-guidelines';
import { CampaignLaunchDialog } from '../../campaign-creator/campaign-launch-dialog/campaign-launch-dialog';
import { MarketCampaign } from '../market-campaigns';
import { MarketMetricChart } from '../market-metric-chart/market-metric-chart';
import { toMarketCampaign } from '../to-market-campaign';

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function clampDateInputToMin(value: string, min: string): string {
  if (!value || value < min) {
    return min;
  }

  return value;
}

function buildMetricSeries(base: number, seed: number, points = 25): number[] {
  return Array.from({ length: points }, (_, index) => {
    const wave =
      Math.sin((index + seed) / 3.1) * 0.11 + Math.cos((index + seed * 1.7) / 4.8) * 0.07;
    const drift = ((index % 7) - 3) * 0.008;
    return Math.max(0, Number((base * (0.88 + wave + drift)).toFixed(4)));
  });
}

function niceCeiling(value: number): number {
  if (value <= 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  if (normalized <= 1) {
    return magnitude;
  }
  if (normalized <= 2) {
    return 2 * magnitude;
  }
  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

function availableBalanceFromUser(user: UserPublicWithAccount | null): number {
  if (!user?.account) {
    return 0;
  }

  return parseAccountMoney(user.account.available_balance);
}

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

type MetricChartView = {
  heroValue: string;
  yLabels: string[];
  yMax: number;
  currentValues: number[];
  previousValues: number[];
  currentLegend: string;
  previousLegend: string;
};

@Component({
  selector: 'app-market-campaign-detail',
  imports: [RouterLink, TranslatePipe, MarketMetricChart, CampaignLaunchDialog],
  templateUrl: './market-campaign-detail.html',
  styleUrl: './market-campaign-detail.scss',
})
export class MarketCampaignDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly campaignsService = inject(CampaignsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly userCampaignsService = inject(UserCampaignsService);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly launchDialogOpen = signal(false);
  protected readonly launching = signal(false);
  protected readonly launchError = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly campaign = signal<MarketCampaign | undefined>(undefined);
  protected readonly availableBalance = signal(0);

  private readonly campaignId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly minStartDate = toDateInputValue(startOfToday());
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');
  protected readonly budget = signal('');

  protected readonly durationDays = computed(() =>
    campaignGuidelinesDurationDays(this.startDate(), this.endDate()),
  );

  protected readonly budgetAmount = computed(() => {
    const value = Number(this.budget().replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
  });

  protected readonly estimatedImpressions = computed(() => {
    const campaign = this.campaign();
    const budget = this.budgetAmount();
    if (!campaign || campaign.cpm <= 0 || budget <= 0) {
      return 0;
    }

    return Math.round((budget / campaign.cpm) * 1000);
  });

  protected readonly estimatedGrossProfit = computed(() => {
    const campaign = this.campaign();
    const budget = this.budgetAmount();
    const days = this.durationDays();
    if (!campaign || budget <= 0 || days === null || days <= 0) {
      return 0;
    }

    return Math.round(budget * (campaign.profitMonthly / 100) * (days / 30) * 100) / 100;
  });

  protected readonly estimatedGrossRevenue = computed(
    () => this.budgetAmount() + this.estimatedGrossProfit(),
  );

  protected readonly estimatedProfitPercent = computed(() => {
    const budget = this.budgetAmount();
    if (budget <= 0) {
      return 0;
    }

    return Math.round((this.estimatedGrossProfit() / budget) * 10000) / 100;
  });

  protected readonly canStartCampaign = computed(() => {
    const campaign = this.campaign();
    if (!campaign) {
      return false;
    }

    const launchBudget = Math.max(this.budgetAmount(), campaign.minBudget);
    return this.availableBalance() >= launchBudget;
  });

  protected readonly cpmChart = computed(() => {
    const campaign = this.campaign();
    return campaign ? this.buildMetricChart(campaign.cpm, campaign.currency, 1) : null;
  });

  protected readonly epcChart = computed(() => {
    const campaign = this.campaign();
    return campaign ? this.buildMetricChart(campaign.epc, campaign.currency, 3) : null;
  });

  private readonly configCampaignId = signal<string | null>(null);
  private launchSub: Subscription | null = null;

  constructor() {
    effect((onCleanup) => {
      const id = this.campaignId();
      if (!id) {
        this.campaign.set(undefined);
        this.loading.set(false);
        this.loadError.set(false);
        return;
      }

      this.loading.set(true);
      this.loadError.set(false);

      const sub = this.authService.getMe().pipe(
        switchMap((me) =>
          forkJoin({
            campaign: this.campaignsService.getById(id),
            categories: this.categoriesService.getAll(),
            user: this.usersService.getById(me.id).pipe(catchError(() => of(null))),
          }),
        ),
      ).subscribe({
        next: ({ campaign, categories, user }) => {
          const categoryName =
            categories.find((category) => category.id === campaign.category_id)?.name ?? '';
          this.campaign.set(toMarketCampaign(campaign, categoryName));
          this.availableBalance.set(availableBalanceFromUser(user));
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.campaign.set(undefined);
          this.availableBalance.set(0);
          this.loading.set(false);
          this.loadError.set(!(error instanceof HttpErrorResponse && error.status === 404));
        },
      });

      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
      const campaign = this.campaign();
      if (!campaign || this.configCampaignId() === campaign.id) {
        return;
      }

      this.configCampaignId.set(campaign.id);
      this.resetConfig(campaign);
    });
  }

  protected onStartDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const previousStart = this.startDate();
    const next = clampDateInputToMin(input.value, this.minStartDate);
    input.value = next;

    const duration = campaignGuidelinesDurationDays(previousStart, this.endDate());
    this.startDate.set(next);

    if (duration !== null && duration >= 0) {
      this.endDate.set(addDaysToDateInput(next, duration));
      return;
    }

    if (this.endDate() && this.endDate() < next) {
      this.endDate.set(addDaysToDateInput(next, this.campaign()?.days ?? 0));
    }
  }

  protected onEndDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const minEnd = this.startDate() || this.minStartDate;
    const next = clampDateInputToMin(input.value, minEnd);
    input.value = next;
    this.endDate.set(next);
  }

  protected onBudgetInput(event: Event): void {
    this.budget.set((event.target as HTMLInputElement).value);
  }

  protected openDatePicker(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    input.showPicker?.();
  }

  protected openLaunchDialog(): void {
    if (!this.canStartCampaign()) {
      return;
    }

    if (this.startDate() < this.minStartDate) {
      this.startDate.set(this.minStartDate);
    }

    this.launchError.set(null);
    this.launchDialogOpen.set(true);
  }

  protected closeLaunchDialog(): void {
    this.launchSub?.unsubscribe();
    this.launchSub = null;
    this.launching.set(false);
    this.launchError.set(null);
    this.launchDialogOpen.set(false);
  }

  protected confirmLaunch(): void {
    const campaign = this.campaign();
    if (!campaign || this.launching() || !this.canStartCampaign()) {
      return;
    }

    const startDate = this.startDate() < this.minStartDate ? this.minStartDate : this.startDate();
    const endDate =
      this.endDate() && this.endDate() >= startDate
        ? this.endDate()
        : addDaysToDateInput(startDate, campaign.days);
    const budget = Math.max(this.budgetAmount(), campaign.minBudget);

    this.startDate.set(startDate);
    this.endDate.set(endDate);
    this.launching.set(true);
    this.launchError.set(null);

    this.launchSub = this.userCampaignsService
      .start({
        campaign_id: campaign.id,
        start_date: startDate,
        end_date: endDate,
        budget,
      })
      .subscribe({
        next: () => {
          this.launching.set(false);
          this.launchDialogOpen.set(false);
          void this.router.navigate(['/', APP_ROUTE_PATHS.myCampaigns]);
        },
        error: (error: unknown) => {
          this.launching.set(false);
          const insufficient =
            error instanceof HttpErrorResponse &&
            error.status === 400 &&
            error.error?.detail === 'Insufficient funds';
          this.launchError.set(
            this.translationService.translate(
              insufficient
                ? 'app.markets.detail.insufficientFunds'
                : 'app.markets.detail.launchError',
            ),
          );
        },
      });
  }

  protected countryFlagUrl(iso: string): string {
    return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
  }

  protected formatBudget(amount: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  protected formatMoney(amount: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  protected formatPercent(value: number): string {
    return `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}%`;
  }

  protected formatInteger(value: number): string {
    return new Intl.NumberFormat(undefined).format(value);
  }

  private buildMetricChart(base: number, currency: string, seed: number): MetricChartView {
    const currentValues = buildMetricSeries(base, seed);
    const previousValues = buildMetricSeries(base * 0.92, seed + 11);
    const peak = Math.max(...currentValues, ...previousValues, base);
    const yMax = niceCeiling(peak * 1.15);
    const mid = yMax / 2;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return {
      heroValue: this.formatMoney(base, currency),
      yLabels: [
        this.formatAxisMoney(yMax, currency),
        this.formatAxisMoney(mid, currency),
        this.formatAxisMoney(0, currency),
      ],
      yMax,
      currentValues,
      previousValues,
      currentLegend: this.formatLegendDate(today),
      previousLegend: this.formatLegendDate(yesterday),
    };
  }

  private formatAxisMoney(amount: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: amount < 1 ? 2 : 0,
    }).format(amount);
  }

  private formatLegendDate(date: Date): string {
    this.translationService.activeLanguage();
    const locale = localeForLanguage(this.translationService.activeLanguage());
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private resetConfig(campaign: MarketCampaign): void {
    const start = this.minStartDate;

    this.startDate.set(start);
    this.endDate.set(addDaysToDateInput(start, campaign.days));
    this.budget.set(String(campaign.minBudget));
  }
}
