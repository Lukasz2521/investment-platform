import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserCampaignsService } from '../../core/campaigns/services/user-campaigns.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import type { MarketCampaign } from '../markets/market-campaigns';
import {
  CampaignConsentsForm,
  createDefaultCampaignConsentsForm,
  isCampaignConsentsValid,
} from './campaign-consents';
import { CampaignCreatorConsents } from './campaign-creator-consents/campaign-creator-consents';
import { CampaignCreatorCountries } from './campaign-creator-countries/campaign-creator-countries';
import { CampaignCreatorGuidelines } from './campaign-creator-guidelines/campaign-creator-guidelines';
import { CampaignCreatorSelect } from './campaign-creator-select/campaign-creator-select';
import {
  CampaignCreatorStepId,
  CampaignCreatorStepper,
} from './campaign-creator-stepper/campaign-creator-stepper';
import { CampaignCreatorSummary } from './campaign-creator-summary/campaign-creator-summary';
import {
  addDaysToDateInput,
  CAMPAIGN_GUIDELINES_MAX_DAYS,
  CAMPAIGN_GUIDELINES_MIN_DAYS,
  CampaignGuidelinesForm,
  campaignGuidelinesDurationDays,
  createDefaultCampaignGuidelinesForm,
  isCampaignGuidelinesValid,
} from './campaign-guidelines';
import { CampaignLaunchDialog } from './campaign-launch-dialog/campaign-launch-dialog';

const FIRST_STEP: CampaignCreatorStepId = 1;
const LAST_STEP: CampaignCreatorStepId = 5;

function todayInput(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-campaign-creator',
  imports: [
    TranslatePipe,
    CampaignCreatorStepper,
    CampaignCreatorSelect,
    CampaignCreatorGuidelines,
    CampaignCreatorCountries,
    CampaignCreatorSummary,
    CampaignCreatorConsents,
    CampaignLaunchDialog,
  ],
  templateUrl: './campaign-creator.html',
  styleUrl: './campaign-creator.scss',
})
export class CampaignCreator implements OnDestroy {
  private readonly userCampaignsService = inject(UserCampaignsService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private launchSub: Subscription | null = null;

  protected readonly currentStep = signal<CampaignCreatorStepId>(1);
  protected readonly selectedCampaign = signal<MarketCampaign | null>(null);
  protected readonly guidelines = signal<CampaignGuidelinesForm>(
    createDefaultCampaignGuidelinesForm(),
  );
  protected readonly selectedCountries = signal<string[]>([]);
  protected readonly consents = signal<CampaignConsentsForm>(createDefaultCampaignConsentsForm());
  protected readonly launchDialogOpen = signal(false);
  protected readonly launching = signal(false);
  protected readonly launchError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly canGoBack = computed(() => this.currentStep() > FIRST_STEP);

  protected readonly isLastStep = computed(() => this.currentStep() === LAST_STEP);

  protected readonly canGoNext = computed(() => {
    const step = this.currentStep();

    if (step === 1) {
      return this.selectedCampaign() !== null;
    }

    if (step === 2) {
      return isCampaignGuidelinesValid(this.guidelines());
    }

    if (step === 3) {
      return this.selectedCountries().length > 0;
    }

    if (step === 4) {
      return this.selectedCampaign() !== null && this.selectedCountries().length > 0;
    }

    if (step === 5) {
      return isCampaignConsentsValid(this.consents()) && !this.submitted() && !this.launching();
    }

    return false;
  });

  ngOnDestroy(): void {
    this.launchSub?.unsubscribe();
  }

  protected onCampaignSelected(campaign: MarketCampaign): void {
    this.selectedCampaign.set(campaign);
    const form = this.guidelines();
    const minEnd = addDaysToDateInput(form.startDate, CAMPAIGN_GUIDELINES_MIN_DAYS);
    const maxEnd = addDaysToDateInput(form.startDate, CAMPAIGN_GUIDELINES_MAX_DAYS);
    let endDate = form.endDate;
    if (!endDate || endDate < minEnd) {
      endDate = minEnd;
    }
    if (endDate > maxEnd) {
      endDate = maxEnd;
    }
    if (endDate !== form.endDate) {
      this.guidelines.set({ ...form, endDate });
    }
  }

  protected onGuidelinesChange(form: CampaignGuidelinesForm): void {
    this.guidelines.set(form);
  }

  protected onCountriesChange(countries: string[]): void {
    this.selectedCountries.set(countries);
  }

  protected onConsentsChange(form: CampaignConsentsForm): void {
    this.consents.set(form);
  }

  protected goBack(): void {
    if (!this.canGoBack()) {
      return;
    }

    this.submitted.set(false);
    this.launchDialogOpen.set(false);
    this.currentStep.update((step) => (step - 1) as CampaignCreatorStepId);
  }

  protected goNext(): void {
    if (!this.canGoNext()) {
      return;
    }

    if (this.isLastStep()) {
      this.launchDialogOpen.set(true);
      return;
    }

    this.currentStep.update((step) => (step + 1) as CampaignCreatorStepId);
  }

  protected closeLaunchDialog(): void {
    this.launchSub?.unsubscribe();
    this.launchSub = null;
    this.launching.set(false);
    this.launchError.set(null);
    this.launchDialogOpen.set(false);
  }

  protected confirmLaunch(): void {
    const campaign = this.selectedCampaign();
    if (!campaign || this.launching() || !isCampaignConsentsValid(this.consents())) {
      return;
    }

    const guidelines = this.guidelines();
    const duration = campaignGuidelinesDurationDays(guidelines.startDate, guidelines.endDate);
    const days = Math.min(
      CAMPAIGN_GUIDELINES_MAX_DAYS,
      Math.max(CAMPAIGN_GUIDELINES_MIN_DAYS, duration ?? CAMPAIGN_GUIDELINES_MIN_DAYS),
    );
    const startDate = todayInput();
    const endDate = addDaysToDateInput(startDate, days);
    const budget = Number(guidelines.budget.replace(',', '.'));

    this.launching.set(true);
    this.launchError.set(null);

    this.launchSub = this.userCampaignsService
      .start({
        campaign_id: campaign.id,
        start_date: startDate,
        end_date: endDate,
        budget,
        creator: true,
      })
      .subscribe({
        next: () => {
          this.launching.set(false);
          this.launchDialogOpen.set(false);
          this.submitted.set(true);
          void this.router.navigate(['/', APP_ROUTE_PATHS.myCampaigns]);
        },
        error: (error: unknown) => {
          this.launching.set(false);
          const detail =
            error instanceof HttpErrorResponse && typeof error.error?.detail === 'string'
              ? error.error.detail
              : '';
          const key =
            detail === 'Insufficient funds'
              ? 'app.markets.detail.insufficientFunds'
              : detail === 'Profile data incomplete'
                ? 'app.markets.detail.profileIncomplete'
                : detail === 'Required documents missing'
                  ? 'app.markets.detail.documentsIncomplete'
                  : 'app.markets.detail.launchError';
          this.launchError.set(this.translationService.translate(key));
        },
      });
  }
}
