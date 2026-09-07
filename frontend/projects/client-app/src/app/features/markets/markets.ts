import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CampaignsService } from '../../core/campaigns/services/campaigns.service';
import { CategoriesService } from '../../core/campaigns/services/categories.service';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { CampaignCard } from '../campaigns/campaign-card/campaign-card';
import { CampaignCardRow } from '../campaigns/campaign-card-row/campaign-card-row';
import {
  CampaignMembershipPlan,
  CampaignOption,
} from '../campaign-creator/campaign-options';
import { getMarketCategorySections, MarketCampaign } from './market-campaigns';
import { toMarketCampaign } from './to-market-campaign';

type MarketFilters = {
  membershipPlan: CampaignMembershipPlan | '';
  titleQuery: string;
  budgetMin: number;
  budgetMax: number;
};

const BUDGET_FLOOR = 0;
const BUDGET_CEIL = 100_000;
const DEFAULT_BUDGET_MAX = BUDGET_CEIL;

const MEMBERSHIP_PLANS: CampaignMembershipPlan[] = [
  'fundament',
  'accelerator',
  'strategy',
  'alpha',
  'protector',
  'dominion',
];

const BUDGET_TICKS = [0, 5_000, 10_000, 20_000, 35_000, 50_000, 75_000, 100_000];

function createDefaultFilters(): MarketFilters {
  return {
    membershipPlan: '',
    titleQuery: '',
    budgetMin: BUDGET_FLOOR,
    budgetMax: DEFAULT_BUDGET_MAX,
  };
}

function matchesFilters(campaign: MarketCampaign, filters: MarketFilters): boolean {
  if (filters.membershipPlan && campaign.membershipPlan !== filters.membershipPlan) {
    return false;
  }

  const query = filters.titleQuery.trim().toLowerCase();
  if (query && !campaign.title.toLowerCase().includes(query)) {
    return false;
  }

  if (campaign.minBudget < filters.budgetMin || campaign.minBudget > filters.budgetMax) {
    return false;
  }

  return true;
}

@Component({
  selector: 'app-markets',
  imports: [TranslatePipe, CampaignCard, CampaignCardRow],
  templateUrl: './markets.html',
  styleUrl: './markets.scss',
})
export class Markets implements OnInit {
  private readonly campaignsService = inject(CampaignsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);

  protected readonly budgetFloor = BUDGET_FLOOR;
  protected readonly budgetCeil = BUDGET_CEIL;
  protected readonly budgetTicks = BUDGET_TICKS;
  protected readonly membershipPlans = MEMBERSHIP_PLANS;

  protected readonly draftMembershipPlan = signal<CampaignMembershipPlan | ''>('');
  protected readonly draftTitleQuery = signal('');
  protected readonly draftBudgetMin = signal(BUDGET_FLOOR);
  protected readonly draftBudgetMax = signal(DEFAULT_BUDGET_MAX);

  private readonly appliedFilters = signal<MarketFilters>(createDefaultFilters());
  private readonly campaigns = signal<MarketCampaign[]>([]);
  private readonly categoryCatalog = signal<{ id: string; name: string }[]>([]);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly budgetRangeFill = computed(() => {
    const span = BUDGET_CEIL - BUDGET_FLOOR || 1;
    const start = ((this.draftBudgetMin() - BUDGET_FLOOR) / span) * 100;
    const end = ((this.draftBudgetMax() - BUDGET_FLOOR) / span) * 100;
    return { start, end };
  });

  protected readonly categories = computed(() => {
    const filters = this.appliedFilters();
    const campaigns = this.campaigns().filter((campaign) => matchesFilters(campaign, filters));
    return getMarketCategorySections(campaigns, this.categoryCatalog());
  });

  ngOnInit(): void {
    this.loadMarket();
  }

  protected onMembershipPlanChange(event: Event): void {
    this.draftMembershipPlan.set(
      (event.target as HTMLSelectElement).value as CampaignMembershipPlan | '',
    );
  }

  protected onTitleQueryInput(event: Event): void {
    this.draftTitleQuery.set((event.target as HTMLInputElement).value);
  }

  protected onBudgetMinInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    const next = Math.min(value, this.draftBudgetMax());
    this.draftBudgetMin.set(next);
  }

  protected onBudgetMaxInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    const next = Math.max(value, this.draftBudgetMin());
    this.draftBudgetMax.set(next);
  }

  protected applyFilters(): void {
    this.appliedFilters.set({
      membershipPlan: this.draftMembershipPlan(),
      titleQuery: this.draftTitleQuery(),
      budgetMin: this.draftBudgetMin(),
      budgetMax: this.draftBudgetMax(),
    });
  }

  protected clearFilters(): void {
    const defaults = createDefaultFilters();
    this.draftMembershipPlan.set(defaults.membershipPlan);
    this.draftTitleQuery.set(defaults.titleQuery);
    this.draftBudgetMin.set(defaults.budgetMin);
    this.draftBudgetMax.set(defaults.budgetMax);
    this.appliedFilters.set(defaults);
  }

  protected membershipPlanLabelKey(plan: CampaignMembershipPlan): string {
    return `app.campaignCreator.select.plans.${plan}`;
  }

  protected formatBudget(value: number): string {
    return `${new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(value)}€`;
  }

  protected openCampaign(campaign: CampaignOption): void {
    void this.router.navigate(['/', APP_ROUTE_PATHS.markets, campaign.id]);
  }

  private loadMarket(): void {
    this.loading.set(true);
    this.loadError.set(false);

    forkJoin({
      campaigns: this.campaignsService.getAll(),
      categories: this.categoriesService.getAll(),
    }).subscribe({
      next: ({ campaigns, categories }) => {
        const nameById = new Map(categories.map((category) => [category.id, category.name]));
        this.categoryCatalog.set(categories.map((category) => ({ id: category.id, name: category.name })));
        this.campaigns.set(
          campaigns.data.map((campaign) =>
            toMarketCampaign(campaign, nameById.get(campaign.category_id) ?? ''),
          ),
        );
        this.loading.set(false);
      },
      error: () => {
        this.campaigns.set([]);
        this.categoryCatalog.set([]);
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }
}
