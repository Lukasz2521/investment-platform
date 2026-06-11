import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Toolbar } from 'primeng/toolbar';

import { CampaignPublic } from '../../core/campaigns/models/campaign.model';
import { CategoryPublic } from '../../core/campaigns/models/category.model';
import { CampaignsService } from '../../core/campaigns/services/campaigns.service';
import { CategoriesService } from '../../core/campaigns/services/categories.service';
import {
  CampaignTableRow,
  mapCampaignsForTable,
} from '../../core/campaigns/utils/campaign-display.utils';
import { CampaignsTable } from './campaigns-table/campaigns-table';

@Component({
  selector: 'admin-app-campaigns-list',
  imports: [Toolbar, Card, Button, CampaignsTable],
  templateUrl: './campaigns-list.html',
  styleUrl: './campaigns-list.scss',
})
export class CampaignsList {
  private readonly campaignsService = inject(CampaignsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly campaigns = signal<CampaignTableRow[]>([]);

  private loadedCampaigns: CampaignPublic[] | null = null;
  private loadedCategories: CategoryPublic[] | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadCategories();
      this.loadCampaigns();
    });
  }

  private loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => {
        this.loadedCategories = categories;
        this.syncCampaigns();
      },
      error: () => this.loading.set(false),
    });
  }

  private loadCampaigns(): void {
    this.campaignsService.getAll().subscribe({
      next: ({ data }) => {
        this.loadedCampaigns = data;
        this.syncCampaigns();
      },
      error: () => this.loading.set(false),
    });
  }

  private syncCampaigns(): void {
    if (!this.loadedCampaigns || !this.loadedCategories) {
      return;
    }

    this.campaigns.set(mapCampaignsForTable(this.loadedCampaigns, this.loadedCategories));
    this.loading.set(false);
  }
}
