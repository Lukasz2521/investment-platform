import { Component } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';

@Component({
  selector: 'app-campaign-creator',
  imports: [TranslatePipe],
  templateUrl: './campaign-creator.html',
  styleUrl: './campaign-creator.scss',
})
export class CampaignCreator {}
