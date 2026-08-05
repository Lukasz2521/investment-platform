import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../../core/routing/app-route-paths';
import {
  addDaysToDateInput,
  campaignGuidelinesDurationDays,
} from '../../campaign-creator/campaign-guidelines';
import {
  getMarketCampaign,
  getMarketCategoryLabelKey,
  MarketCampaign,
  MarketCategoryId,
} from '../market-campaigns';
import { MarketMetricChart } from '../market-metric-chart/market-metric-chart';

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  imports: [RouterLink, TranslatePipe, MarketMetricChart],
  templateUrl: './market-campaign-detail.html',
  styleUrl: './market-campaign-detail.scss',
})
export class MarketCampaignDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;

  private readonly campaignId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly campaign = computed(() => {
    const id = this.campaignId();
    return id ? getMarketCampaign(id) : undefined;
  });

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

  protected readonly cpmChart = computed(() => {
    const campaign = this.campaign();
    return campaign ? this.buildMetricChart(campaign.cpm, campaign.currency, 1) : null;
  });

  protected readonly epcChart = computed(() => {
    const campaign = this.campaign();
    return campaign ? this.buildMetricChart(campaign.epc, campaign.currency, 3) : null;
  });

  private readonly configCampaignId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const campaign = this.campaign();
      if (!campaign || this.configCampaignId() === campaign.id) {
        return;
      }

      this.configCampaignId.set(campaign.id);
      this.resetConfig(campaign);
    });
  }

  protected categoryLabelKey(categoryId: MarketCategoryId): string {
    return getMarketCategoryLabelKey(categoryId);
  }

  protected onStartDateInput(event: Event): void {
    this.startDate.set((event.target as HTMLInputElement).value);
  }

  protected onEndDateInput(event: Event): void {
    this.endDate.set((event.target as HTMLInputElement).value);
  }

  protected onBudgetInput(event: Event): void {
    this.budget.set((event.target as HTMLInputElement).value);
  }

  protected openDatePicker(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    input.showPicker?.();
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = toDateInputValue(today);

    this.startDate.set(start);
    this.endDate.set(addDaysToDateInput(start, campaign.days));
    this.budget.set(String(campaign.minBudget));
  }
}
