import { Component, computed, input, output } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import {
  addDaysToDateInput,
  CAMPAIGN_GUIDELINES_AGE_MAX,
  CAMPAIGN_GUIDELINES_AGE_MIN,
  CAMPAIGN_GUIDELINES_MAX_DAYS,
  CAMPAIGN_GUIDELINES_MIN_BUDGET,
  CAMPAIGN_GUIDELINES_MIN_DAYS,
  CampaignGuidelinesForm,
  campaignGuidelinesDurationDays,
} from '../campaign-guidelines';

@Component({
  selector: 'app-campaign-creator-guidelines',
  imports: [TranslatePipe],
  templateUrl: './campaign-creator-guidelines.html',
  styleUrl: './campaign-creator-guidelines.scss',
})
export class CampaignCreatorGuidelines {
  readonly value = input.required<CampaignGuidelinesForm>();
  readonly minimumDays = input(CAMPAIGN_GUIDELINES_MIN_DAYS);
  readonly minimumBudget = input(CAMPAIGN_GUIDELINES_MIN_BUDGET);
  readonly valueChange = output<CampaignGuidelinesForm>();

  protected readonly ageFloor = CAMPAIGN_GUIDELINES_AGE_MIN;
  protected readonly ageCeil = CAMPAIGN_GUIDELINES_AGE_MAX;
  protected readonly maxDays = CAMPAIGN_GUIDELINES_MAX_DAYS;
  protected readonly ageTicks = [0, 20, 40, 60, 80, 100];

  protected readonly durationDays = computed(() => {
    const current = this.value();
    return campaignGuidelinesDurationDays(current.startDate, current.endDate);
  });

  protected readonly minEndDate = computed(() =>
    addDaysToDateInput(this.value().startDate, this.minimumDays()),
  );

  protected readonly budgetBelowMinimum = computed(() => {
    const raw = this.value().budget.trim().replace(',', '.');
    if (!raw) {
      return false;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed < this.minimumBudget();
  });

  protected readonly maxEndDate = computed(() =>
    addDaysToDateInput(this.value().startDate, this.maxDays),
  );

  protected readonly ageRangeFill = computed(() => {
    const { ageMin, ageMax } = this.value();
    const span = this.ageCeil - this.ageFloor;
    const start = ((ageMin - this.ageFloor) / span) * 100;
    const end = ((ageMax - this.ageFloor) / span) * 100;
    return { start, end };
  });

  protected toggleGender(key: 'male' | 'female'): void {
    this.patch({ [key]: !this.value()[key] });
  }

  protected onEndDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let next = input.value;
    const minEnd = this.minEndDate();
    const maxEnd = this.maxEndDate();

    if (next && next < minEnd) {
      next = minEnd;
    }

    if (next && next > maxEnd) {
      next = maxEnd;
    }

    input.value = next;
    this.patch({ endDate: next });
  }

  protected openEndDatePicker(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    input.showPicker?.();
  }

  protected onBudgetInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.patch({ budget: next });
  }

  protected onAgeMinInput(event: Event): void {
    const next = Number((event.target as HTMLInputElement).value);
    const ageMax = this.value().ageMax;
    this.patch({ ageMin: Math.min(next, ageMax) });
  }

  protected onAgeMaxInput(event: Event): void {
    const next = Number((event.target as HTMLInputElement).value);
    const ageMin = this.value().ageMin;
    this.patch({ ageMax: Math.max(next, ageMin) });
  }

  private patch(partial: Partial<CampaignGuidelinesForm>): void {
    this.valueChange.emit({ ...this.value(), ...partial });
  }
}
