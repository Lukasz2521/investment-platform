import { Component, input, output, signal } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { CampaignOption } from '../../campaign-creator/campaign-options';

export type CampaignCardVariant = 'creator' | 'markets';

@Component({
  selector: 'app-campaign-card',
  imports: [TranslatePipe],
  templateUrl: './campaign-card.html',
  styleUrl: './campaign-card.scss',
  host: {
    class: 'campaign-card',
    '[class.campaign-card--selected]': 'selected()',
  },
})
export class CampaignCard {
  readonly campaign = input.required<CampaignOption>();
  readonly selected = input(false);
  readonly variant = input<CampaignCardVariant>('creator');
  readonly select = output<CampaignOption>();

  protected readonly infoOpen = signal(false);

  protected onSelect(): void {
    this.select.emit(this.campaign());
  }

  protected openInfo(): void {
    this.infoOpen.set(true);
  }

  protected closeInfo(): void {
    this.infoOpen.set(false);
  }

  protected formatBudget(campaign: CampaignOption): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: campaign.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(campaign.minBudget);
  }

  protected formatMetricMoney(value: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  protected formatPercent(value: number): string {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  protected membershipPlanLabelKey(plan: CampaignOption['membershipPlan']): string {
    return `app.campaignCreator.select.plans.${plan}`;
  }
}
