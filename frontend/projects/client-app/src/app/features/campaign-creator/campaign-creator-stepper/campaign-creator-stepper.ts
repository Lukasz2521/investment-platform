import { Component, input } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';

export type CampaignCreatorStepId = 1 | 2 | 3 | 4 | 5;

type CampaignCreatorStepIcon =
  | 'campaign'
  | 'guidelines'
  | 'country'
  | 'summary'
  | 'consents';

type CampaignCreatorStep = {
  id: CampaignCreatorStepId;
  labelKey: string;
  icon: CampaignCreatorStepIcon;
};

@Component({
  selector: 'app-campaign-creator-stepper',
  imports: [TranslatePipe],
  templateUrl: './campaign-creator-stepper.html',
  styleUrl: './campaign-creator-stepper.scss',
})
export class CampaignCreatorStepper {
  readonly currentStep = input.required<CampaignCreatorStepId>();

  protected readonly steps: CampaignCreatorStep[] = [
    {
      id: 1,
      labelKey: 'app.campaignCreator.steps.selectCampaign',
      icon: 'campaign',
    },
    {
      id: 2,
      labelKey: 'app.campaignCreator.steps.guidelines',
      icon: 'guidelines',
    },
    {
      id: 3,
      labelKey: 'app.campaignCreator.steps.selectCountry',
      icon: 'country',
    },
    {
      id: 4,
      labelKey: 'app.campaignCreator.steps.summary',
      icon: 'summary',
    },
    {
      id: 5,
      labelKey: 'app.campaignCreator.steps.consents',
      icon: 'consents',
    },
  ];

  protected stepState(stepId: CampaignCreatorStepId): 'active' | 'completed' | 'upcoming' {
    const current = this.currentStep();
    if (stepId === current) {
      return 'active';
    }
    if (stepId < current) {
      return 'completed';
    }
    return 'upcoming';
  }
}
