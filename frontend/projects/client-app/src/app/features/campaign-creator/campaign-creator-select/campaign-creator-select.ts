import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { catchError, forkJoin, of, switchMap } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { CampaignsService } from '../../../core/campaigns/services/campaigns.service';
import { CategoriesService } from '../../../core/campaigns/services/categories.service';
import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { UsersService } from '../../../core/users/services/users.service';
import { CampaignCard } from '../../campaigns/campaign-card/campaign-card';
import { CampaignCardRow } from '../../campaigns/campaign-card-row/campaign-card-row';
import type { MarketCampaign } from '../../markets/market-campaigns';
import { toMarketCampaign } from '../../markets/to-market-campaign';
import { CampaignOption } from '../campaign-options';

@Component({
  selector: 'app-campaign-creator-select',
  imports: [TranslatePipe, CampaignCard, CampaignCardRow],
  templateUrl: './campaign-creator-select.html',
  styleUrl: './campaign-creator-select.scss',
})
export class CampaignCreatorSelect implements OnInit {
  private readonly campaignsService = inject(CampaignsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  readonly selectedCampaignId = input<string | null>(null);
  readonly campaignSelected = output<MarketCampaign>();

  protected readonly campaigns = signal<MarketCampaign[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  ngOnInit(): void {
    forkJoin({
      campaigns: this.campaignsService.getAll(),
      categories: this.categoriesService.getAll(),
      user: this.authService.getMe().pipe(
        switchMap((me) => this.usersService.getById(me.id).pipe(catchError(() => of(null)))),
        catchError(() => of(null)),
      ),
    }).subscribe({
      next: ({ campaigns, categories, user }) => {
        const nameById = new Map(categories.map((category) => [category.id, category.name]));
        const participation = user?.account?.participation ?? 0;
        this.campaigns.set(
          campaigns.data.map((campaign) =>
            toMarketCampaign(campaign, nameById.get(campaign.category_id) ?? '', participation),
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

  protected selectCampaign(campaign: CampaignOption): void {
    const selected = this.campaigns().find((item) => item.id === campaign.id);
    if (selected) {
      this.campaignSelected.emit(selected);
    }
  }
}
