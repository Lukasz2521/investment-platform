import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { REGISTER_COUNTRIES } from '../../register/register-options';
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
  readonly valueChange = output<CampaignGuidelinesForm>();

  private readonly countriesSelectRef =
    viewChild.required<ElementRef<HTMLElement>>('countriesSelect');

  protected readonly countries = REGISTER_COUNTRIES;
  protected readonly ageFloor = CAMPAIGN_GUIDELINES_AGE_MIN;
  protected readonly ageCeil = CAMPAIGN_GUIDELINES_AGE_MAX;
  protected readonly minBudget = CAMPAIGN_GUIDELINES_MIN_BUDGET;
  protected readonly minDays = CAMPAIGN_GUIDELINES_MIN_DAYS;
  protected readonly maxDays = CAMPAIGN_GUIDELINES_MAX_DAYS;
  protected readonly ageTicks = [0, 20, 40, 60, 80, 100];
  protected readonly countriesOpen = signal(false);

  protected readonly durationDays = computed(() => {
    const current = this.value();
    return campaignGuidelinesDurationDays(current.startDate, current.endDate);
  });

  protected readonly minEndDate = computed(() =>
    addDaysToDateInput(this.value().startDate, this.minDays),
  );

  protected readonly maxEndDate = computed(() =>
    addDaysToDateInput(this.value().startDate, this.maxDays),
  );

  protected readonly countriesSummary = computed(() => {
    const selected = this.value().countries;
    if (selected.length === 0) {
      return null;
    }
    return selected.join(', ');
  });

  protected readonly ageRangeFill = computed(() => {
    const { ageMin, ageMax } = this.value();
    const span = this.ageCeil - this.ageFloor;
    const start = ((ageMin - this.ageFloor) / span) * 100;
    const end = ((ageMax - this.ageFloor) / span) * 100;
    return { start, end };
  });

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.countriesOpen()) {
      return;
    }

    const target = event.target as Node | null;
    if (!target || this.countriesSelectRef().nativeElement.contains(target)) {
      return;
    }

    this.countriesOpen.set(false);
  }

  protected toggleGender(key: 'male' | 'female'): void {
    this.patch({ [key]: !this.value()[key] });
  }

  protected onEndDateInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
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

  protected onBudgetBlur(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(',', '.');
    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed < this.minBudget) {
      this.patch({ budget: String(this.minBudget) });
    }
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

  protected toggleCountriesOpen(): void {
    this.countriesOpen.update((open) => !open);
  }

  protected isCountrySelected(country: string): boolean {
    return this.value().countries.includes(country);
  }

  protected toggleCountry(country: string): void {
    const selected = this.value().countries;
    const countries = selected.includes(country)
      ? selected.filter((item) => item !== country)
      : [...selected, country];

    this.patch({ countries });
  }

  private patch(partial: Partial<CampaignGuidelinesForm>): void {
    this.valueChange.emit({ ...this.value(), ...partial });
  }
}
