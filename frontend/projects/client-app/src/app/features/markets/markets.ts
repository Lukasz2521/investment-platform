import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { CampaignCard } from '../campaigns/campaign-card/campaign-card';
import { CampaignCardRow } from '../campaigns/campaign-card-row/campaign-card-row';
import {
  CampaignMembershipPlan,
  CampaignOption,
} from '../campaign-creator/campaign-options';
import {
  getMarketCategorySections,
  MARKET_CAMPAIGNS,
  MarketCampaign,
} from './market-campaigns';

type MarketFilters = {
  membershipPlan: CampaignMembershipPlan | '';
  titleQuery: string;
  budgetMin: number;
  budgetMax: number;
};

const BUDGET_FLOOR = 0;
const BUDGET_CEIL = 100_000;
const DEFAULT_BUDGET_MAX = 10_000;

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
export class Markets {
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

  protected readonly budgetRangeFill = computed(() => {
    const span = BUDGET_CEIL - BUDGET_FLOOR || 1;
    const start = ((this.draftBudgetMin() - BUDGET_FLOOR) / span) * 100;
    const end = ((this.draftBudgetMax() - BUDGET_FLOOR) / span) * 100;
    return { start, end };
  });

  protected readonly categories = computed(() => {
    const filters = this.appliedFilters();
    const campaigns = MARKET_CAMPAIGNS.filter((campaign) => matchesFilters(campaign, filters));
    return getMarketCategorySections(campaigns);
  });

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
}
