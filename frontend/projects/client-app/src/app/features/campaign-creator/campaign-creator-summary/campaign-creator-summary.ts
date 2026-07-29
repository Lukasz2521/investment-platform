import { Component, computed, inject, input, signal } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import { campaignCountryLabelKey } from '../campaign-country-codes';
import { CampaignGuidelinesForm } from '../campaign-guidelines';
import { CampaignOption } from '../campaign-options';
import { buildCampaignSummary, CampaignSummaryData } from '../campaign-summary';

@Component({
  selector: 'app-campaign-creator-summary',
  imports: [TranslatePipe],
  templateUrl: './campaign-creator-summary.html',
  styleUrl: './campaign-creator-summary.scss',
})
export class CampaignCreatorSummary {
  private readonly translation = inject(TranslationService);

  readonly campaign = input.required<CampaignOption | null>();
  readonly guidelines = input.required<CampaignGuidelinesForm>();
  readonly selectedCountries = input.required<string[]>();

  protected readonly copied = signal(false);

  protected readonly summary = computed(() => {
    const campaign = this.campaign();
    if (!campaign) {
      return null;
    }

    return buildCampaignSummary(campaign, this.guidelines(), this.selectedCountries());
  });

  protected formatDate(value: string): string {
    this.translation.activeLanguage();
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(this.translation.activeLanguage(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  protected formatMoney(amount: number, currency: string): string {
    this.translation.activeLanguage();
    return new Intl.NumberFormat(this.translation.activeLanguage(), {
      style: 'currency',
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  protected formatInteger(value: number): string {
    this.translation.activeLanguage();
    return new Intl.NumberFormat(this.translation.activeLanguage()).format(value);
  }

  protected durationLabel(summary: CampaignSummaryData): string {
    const start = this.formatDate(summary.startDate);
    const end = this.formatDate(summary.endDate);
    const days = this.translation.translate('app.campaignCreator.summary.days', {
      count: String(summary.durationDays),
    });

    return `${start} – ${end} (${days})`;
  }

  protected ageLabel(summary: CampaignSummaryData): string {
    return `${summary.ageMin}–${summary.ageMax}`;
  }

  protected genderLabel(summary: CampaignSummaryData): string {
    this.translation.activeLanguage();
    this.translation.translations();

    if (summary.male && summary.female) {
      return this.translation.translate('app.campaignCreator.summary.gender.both');
    }

    if (summary.male) {
      return this.translation.translate('app.campaignCreator.summary.gender.male');
    }

    if (summary.female) {
      return this.translation.translate('app.campaignCreator.summary.gender.female');
    }

    return '—';
  }

  protected countriesLabel(summary: CampaignSummaryData): string {
    this.translation.activeLanguage();
    this.translation.translations();

    return summary.countryCodes
      .map((code) => this.translation.translate(campaignCountryLabelKey(code)))
      .join(', ');
  }

  protected riskLabel(summary: CampaignSummaryData): string {
    this.translation.activeLanguage();
    this.translation.translations();
    return this.translation.translate(`app.campaignCreator.summary.risk.${summary.risk}`);
  }

  protected async copySummary(): Promise<void> {
    const summary = this.summary();
    if (!summary || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    const rows = this.buildCopyRows(summary);
    const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1800);
    } catch {
      this.copied.set(false);
    }
  }

  private buildCopyRows(summary: CampaignSummaryData): Array<[string, string]> {
    const t = (key: string) => this.translation.translate(key);

    return [
      [t('app.campaignCreator.summary.params.campaignName'), summary.campaignName],
      [t('app.campaignCreator.summary.params.duration'), this.durationLabel(summary)],
      [
        t('app.campaignCreator.summary.params.budget'),
        this.formatMoney(summary.budget, summary.currency),
      ],
      [t('app.campaignCreator.summary.params.ageGroup'), this.ageLabel(summary)],
      [t('app.campaignCreator.summary.params.gender'), this.genderLabel(summary)],
      [t('app.campaignCreator.summary.params.countries'), this.countriesLabel(summary)],
      [
        t('app.campaignCreator.summary.params.cpm'),
        this.formatMoney(summary.cpm, summary.currency),
      ],
      [
        t('app.campaignCreator.summary.params.epc'),
        this.formatMoney(summary.epc, summary.currency),
      ],
      [
        t('app.campaignCreator.summary.params.impressions'),
        this.formatInteger(summary.estimatedImpressions),
      ],
      [
        t('app.campaignCreator.summary.params.grossProfit'),
        this.formatMoney(summary.estimatedGrossProfit, summary.currency),
      ],
      [t('app.campaignCreator.summary.params.risk'), this.riskLabel(summary)],
    ];
  }
}
