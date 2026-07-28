import { Component, computed, signal } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { CampaignCreatorCountries } from './campaign-creator-countries/campaign-creator-countries';
import { CampaignCreatorGuidelines } from './campaign-creator-guidelines/campaign-creator-guidelines';
import { CampaignCreatorSelect } from './campaign-creator-select/campaign-creator-select';
import {
  CampaignCreatorStepId,
  CampaignCreatorStepper,
} from './campaign-creator-stepper/campaign-creator-stepper';
import {
  CampaignGuidelinesForm,
  createDefaultCampaignGuidelinesForm,
  isCampaignGuidelinesValid,
} from './campaign-guidelines';
import { CampaignOption } from './campaign-options';

const FIRST_STEP: CampaignCreatorStepId = 1;
const LAST_STEP: CampaignCreatorStepId = 5;

@Component({
  selector: 'app-campaign-creator',
  imports: [
    TranslatePipe,
    CampaignCreatorStepper,
    CampaignCreatorSelect,
    CampaignCreatorGuidelines,
    CampaignCreatorCountries,
  ],
  templateUrl: './campaign-creator.html',
  styleUrl: './campaign-creator.scss',
})
export class CampaignCreator {
  protected readonly currentStep = signal<CampaignCreatorStepId>(1);
  protected readonly selectedCampaign = signal<CampaignOption | null>(null);
  protected readonly guidelines = signal<CampaignGuidelinesForm>(
    createDefaultCampaignGuidelinesForm(),
  );
  protected readonly selectedCountries = signal<string[]>([]);

  protected readonly canGoBack = computed(() => this.currentStep() > FIRST_STEP);

  protected readonly canGoNext = computed(() => {
    const step = this.currentStep();

    if (step >= LAST_STEP) {
      return false;
    }

    if (step === 1) {
      return this.selectedCampaign() !== null;
    }

    if (step === 2) {
      return isCampaignGuidelinesValid(this.guidelines());
    }

    if (step === 3) {
      return this.selectedCountries().length > 0;
    }

    return true;
  });

  protected onCampaignSelected(campaign: CampaignOption): void {
    this.selectedCampaign.set(campaign);
  }

  protected onGuidelinesChange(form: CampaignGuidelinesForm): void {
    this.guidelines.set(form);
  }

  protected onCountriesChange(countries: string[]): void {
    this.selectedCountries.set(countries);
  }

  protected goBack(): void {
    if (!this.canGoBack()) {
      return;
    }

    this.currentStep.update((step) => (step - 1) as CampaignCreatorStepId);
  }

  protected goNext(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.currentStep.update((step) => (step + 1) as CampaignCreatorStepId);
  }
}
