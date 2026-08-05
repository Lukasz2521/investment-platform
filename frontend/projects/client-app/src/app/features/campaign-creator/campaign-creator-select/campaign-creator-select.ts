import { Component, input, output } from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { CampaignCard } from '../../campaigns/campaign-card/campaign-card';
import { CampaignCardRow } from '../../campaigns/campaign-card-row/campaign-card-row';
import { CAMPAIGN_OPTIONS, CampaignOption } from '../campaign-options';

@Component({
  selector: 'app-campaign-creator-select',
  imports: [TranslatePipe, CampaignCard, CampaignCardRow],
  templateUrl: './campaign-creator-select.html',
  styleUrl: './campaign-creator-select.scss',
})
export class CampaignCreatorSelect {
  readonly selectedCampaignId = input<string | null>(null);
  readonly campaignSelected = output<CampaignOption>();

  protected readonly campaigns = CAMPAIGN_OPTIONS;

  protected selectCampaign(campaign: CampaignOption): void {
    this.campaignSelected.emit(campaign);
  }
}
