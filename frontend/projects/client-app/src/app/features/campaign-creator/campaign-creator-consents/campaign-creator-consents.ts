import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { CampaignConsentsForm } from '../campaign-consents';

@Component({
  selector: 'app-campaign-creator-consents',
  imports: [TranslatePipe],
  templateUrl: './campaign-creator-consents.html',
  styleUrl: './campaign-creator-consents.scss',
})
export class CampaignCreatorConsents {
  readonly value = input.required<CampaignConsentsForm>();
  readonly valueChange = output<CampaignConsentsForm>();

  protected readonly riskItems = [
    'app.campaignCreator.consents.risk.budget',
    'app.campaignCreator.consents.risk.duration',
    'app.campaignCreator.consents.risk.audience',
    'app.campaignCreator.consents.risk.roi',
  ] as const;

  protected onToggle(key: keyof CampaignConsentsForm, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.valueChange.emit({
      ...this.value(),
      [key]: checked,
    });
  }
}
