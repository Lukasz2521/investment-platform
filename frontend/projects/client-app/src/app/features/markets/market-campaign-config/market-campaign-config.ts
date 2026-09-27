import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-market-campaign-config',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './market-campaign-config.html',
  styleUrl: './market-campaign-config.scss',
})
export class MarketCampaignConfig {
  readonly startDate = input.required<string>();
  readonly endDate = input.required<string>();
  readonly minEndDate = input.required<string>();
  readonly durationDays = input<number | null>(null);
  readonly budget = input.required<string>();
  readonly minBudgetLabel = input.required<string>();
  readonly totalBudget = input.required<string>();
  readonly impressions = input.required<string>();
  readonly grossRevenue = input.required<string>();
  readonly profitPercent = input.required<string>();
  readonly grossProfit = input.required<string>();
  readonly netProfit = input.required<string>();
  readonly balanceAfter = input.required<string>();
  readonly canStart = input.required<boolean>();
  readonly startBlockReason = input<string | null>(null);
  readonly profilePath = input.required<string>();

  readonly endDateChange = output<Event>();
  readonly budgetChange = output<Event>();
  readonly startCampaign = output<void>();

  protected openDatePicker(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    input.showPicker?.();
  }
}
