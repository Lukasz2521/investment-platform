import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CategoriesService } from '../../core/campaigns/services/categories.service';
import { UserCampaignsService } from '../../core/campaigns/services/user-campaigns.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { CampaignOption } from '../campaign-creator/campaign-options';
import { CampaignCard } from '../campaigns/campaign-card/campaign-card';
import {
  getMyCampaignsByStatus,
  MY_CAMPAIGN_TABS,
  MyCampaign,
  MyCampaignStatus,
} from './my-campaigns-data';
import { toMyCampaign } from './to-my-campaign';

@Component({
  selector: 'app-my-campaigns',
  imports: [TranslatePipe, CampaignCard],
  templateUrl: './my-campaigns.html',
  styleUrl: './my-campaigns.scss',
})
export class MyCampaigns implements OnInit {
  private readonly router = inject(Router);
  private readonly userCampaignsService = inject(UserCampaignsService);
  private readonly categoriesService = inject(CategoriesService);

  protected readonly tabs = MY_CAMPAIGN_TABS;
  protected readonly activeTab = signal<MyCampaignStatus>('active');
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  private readonly campaigns = signal<MyCampaign[]>([]);

  protected readonly visibleCampaigns = computed(() =>
    getMyCampaignsByStatus(this.activeTab(), this.campaigns()),
  );

  ngOnInit(): void {
    this.loadCampaigns();
  }

  protected setTab(tab: MyCampaignStatus): void {
    this.activeTab.set(tab);
  }

  protected openCampaign(campaign: CampaignOption): void {
    void this.router.navigate(['/', APP_ROUTE_PATHS.myCampaigns, campaign.id]);
  }

  private loadCampaigns(): void {
    this.loading.set(true);
    this.loadError.set(false);

    forkJoin({
      enrollments: this.userCampaignsService.getAll(),
      categories: this.categoriesService.getAll(),
    }).subscribe({
      next: ({ enrollments, categories }) => {
        const nameById = new Map(categories.map((category) => [category.id, category.name]));
        this.campaigns.set(
          enrollments.data.map((enrollment) =>
            toMyCampaign(enrollment, nameById.get(enrollment.campaign.category_id) ?? ''),
          ),
        );
        this.loading.set(false);
      },
      error: () => {
        this.campaigns.set([]);
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }
}
