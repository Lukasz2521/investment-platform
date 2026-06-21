import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Toolbar } from 'primeng/toolbar';

import { CampaignPublic } from '../../core/campaigns/models/campaign.model';
import { CategoryPublic } from '../../core/campaigns/models/category.model';
import { CampaignsService } from '../../core/campaigns/services/campaigns.service';
import { CategoriesService } from '../../core/campaigns/services/categories.service';
import {
  CampaignTableRow,
  mapCampaignsForTable,
} from '../../core/campaigns/utils/campaign-display.utils';
import {
  CategoryTableRow,
  mapCategoriesForTable,
} from '../../core/campaigns/utils/category-display.utils';
import { CampaignsTable } from './campaigns-table/campaigns-table';
import { CategoriesCreateDialog } from './categories-create-dialog/categories-create-dialog';
import { CategoriesTable } from './categories-table/categories-table';

@Component({
  selector: 'admin-app-campaigns-list',
  imports: [
    Toolbar,
    Card,
    Button,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    CampaignsTable,
    CategoriesTable,
    CategoriesCreateDialog,
  ],
  templateUrl: './campaigns-list.html',
  styleUrl: './campaigns-list.scss',
})
export class CampaignsList {
  private readonly campaignsService = inject(CampaignsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly campaignsLoading = signal(true);
  protected readonly categoriesLoading = signal(true);
  protected readonly campaigns = signal<CampaignTableRow[]>([]);
  protected readonly categories = signal<CategoryTableRow[]>([]);
  protected readonly categoryFormDialogVisible = signal(false);
  protected readonly categoryToEdit = signal<CategoryPublic | null>(null);

  private loadedCampaigns: CampaignPublic[] | null = null;
  private loadedCategories: CategoryPublic[] | null = null;

  constructor() {
    effect(() => {
      if (!this.categoryFormDialogVisible()) {
        this.categoryToEdit.set(null);
      }
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.campaignsLoading.set(false);
        this.categoriesLoading.set(false);
        return;
      }

      this.loadCategories();
      this.loadCampaigns();
    });
  }

  protected openAddCategoryDialog(): void {
    this.categoryToEdit.set(null);
    this.categoryFormDialogVisible.set(true);
  }

  protected openEditCategoryDialog(category: CategoryTableRow): void {
    this.categoryToEdit.set(category);
    this.categoryFormDialogVisible.set(true);
  }

  protected onCategorySaved(): void {
    this.loadCategories(true);
  }

  private loadCategories(showLoading = false): void {
    if (showLoading) {
      this.categoriesLoading.set(true);
    }

    this.categoriesService.getAll().subscribe({
      next: (categories) => {
        this.loadedCategories = categories;
        this.categories.set(mapCategoriesForTable(categories));
        this.categoriesLoading.set(false);
        this.syncCampaigns();
      },
      error: () => this.categoriesLoading.set(false),
    });
  }

  private loadCampaigns(): void {
    this.campaignsService.getAll().subscribe({
      next: ({ data }) => {
        this.loadedCampaigns = data;
        this.syncCampaigns();
      },
      error: () => this.campaignsLoading.set(false),
    });
  }

  private syncCampaigns(): void {
    if (!this.loadedCampaigns || !this.loadedCategories) {
      return;
    }

    this.campaigns.set(mapCampaignsForTable(this.loadedCampaigns, this.loadedCategories));
    this.campaignsLoading.set(false);
  }
}
