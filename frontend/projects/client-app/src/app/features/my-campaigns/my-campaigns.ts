import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { CampaignOption } from '../campaign-creator/campaign-options';
import { CampaignCard } from '../campaigns/campaign-card/campaign-card';
import {
  getMyCampaignsByStatus,
  MY_CAMPAIGN_TABS,
  MyCampaignStatus,
} from './my-campaigns-data';

@Component({
  selector: 'app-my-campaigns',
  imports: [TranslatePipe, CampaignCard],
  templateUrl: './my-campaigns.html',
  styleUrl: './my-campaigns.scss',
})
export class MyCampaigns {
  private readonly router = inject(Router);

  protected readonly tabs = MY_CAMPAIGN_TABS;
  protected readonly activeTab = signal<MyCampaignStatus>('active');

  protected readonly visibleCampaigns = computed(() =>
    getMyCampaignsByStatus(this.activeTab()),
  );

  protected setTab(tab: MyCampaignStatus): void {
    this.activeTab.set(tab);
  }

  protected openCampaign(campaign: CampaignOption): void {
    void this.router.navigate(['/', APP_ROUTE_PATHS.myCampaigns, campaign.id]);
  }
}
