import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { CategoriesService } from '../../../core/campaigns/services/categories.service';
import { UserCampaignsService } from '../../../core/campaigns/services/user-campaigns.service';
import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../../core/routing/app-route-paths';
import { campaignGuidelinesDurationDays } from '../../campaign-creator/campaign-guidelines';
import { MarketMetricChart } from '../../markets/market-metric-chart/market-metric-chart';
import { MyCampaign, MyCampaignStatus } from '../my-campaigns-data';
import { toMyCampaign } from '../to-my-campaign';

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
  selector: 'app-my-campaign-detail',
  imports: [RouterLink, TranslatePipe, MarketMetricChart],
  templateUrl: './my-campaign-detail.html',
  styleUrl: './my-campaign-detail.scss',
})
export class MyCampaignDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly userCampaignsService = inject(UserCampaignsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly campaign = signal<MyCampaign | undefined>(undefined);

  private readonly campaignId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly overview = computed(() => {
    const campaign = this.campaign();
    if (!campaign || !campaign.startDate || !campaign.endDate) {
      return null;
    }

    const days =
      campaignGuidelinesDurationDays(campaign.startDate, campaign.endDate) ?? campaign.days;
    const budget = campaign.minBudget;
    const impressions =
      campaign.cpm > 0 ? Math.round((budget / campaign.cpm) * 1000) : 0;
    const grossProfit =
      Math.round(budget * (campaign.profitMonthly / 100) * (days / 30) * 100) / 100;
    const grossRevenue = budget + grossProfit;
    const profitPercent = budget > 0 ? Math.round((grossProfit / budget) * 10000) / 100 : 0;

    return {
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      days,
      budget,
      impressions,
      grossProfit,
      grossRevenue,
      profitPercent,
    };
  });

  protected readonly cpmChart = computed(() => {
    const campaign = this.campaign();
    return campaign ? this.buildMetricChart(campaign.cpm, campaign.currency, 1) : null;
  });

  protected readonly epcChart = computed(() => {
    const campaign = this.campaign();
    return campaign ? this.buildMetricChart(campaign.epc, campaign.currency, 3) : null;
  });

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

      const sub = forkJoin({
        enrollment: this.userCampaignsService.getById(id),
        categories: this.categoriesService.getAll(),
      }).subscribe({
        next: ({ enrollment, categories }) => {
          const categoryName =
            categories.find((category) => category.id === enrollment.campaign.category_id)?.name ??
            '';
          this.campaign.set(toMyCampaign(enrollment, categoryName));
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.campaign.set(undefined);
          this.loading.set(false);
          this.loadError.set(!(error instanceof HttpErrorResponse && error.status === 404));
        },
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  protected statusLabelKey(status: MyCampaignStatus): string {
    return `app.myCampaigns.tabs.${status}`;
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

  protected formatDate(dateInput: string): string {
    this.translationService.activeLanguage();
    const locale = localeForLanguage(this.translationService.activeLanguage());
    const [year, month, day] = dateInput.split('-').map(Number);
    if (!year || !month || !day) {
      return dateInput;
    }

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
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
}
