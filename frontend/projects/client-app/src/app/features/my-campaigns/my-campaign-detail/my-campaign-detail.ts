import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, interval, map, of, switchMap } from 'rxjs';

import { CategoriesService } from '../../../core/campaigns/services/categories.service';
import { UserCampaignsService } from '../../../core/campaigns/services/user-campaigns.service';
import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import { APP_ROUTE_PATHS } from '../../../core/routing/app-route-paths';
import { MyCampaign, MyCampaignStatus } from '../my-campaigns-data';
import { toMyCampaign } from '../to-my-campaign';
import { userCampaignLiveSnapshot, UserCampaignLiveSnapshot } from '../user-campaign-progress';

function localeForLanguage(language: string): string {
  switch (language) {
    case 'pl':
      return 'pl-PL';
    case 'de':
      return 'de-DE';
    case 'fr':
      return 'fr-FR';
    case 'pt':
      return 'pt-PT';
    case 'ru':
      return 'ru-RU';
    default:
      return 'en-US';
  }
}

const STATS_POLL_MS = 10_000;

@Component({
  selector: 'app-my-campaign-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './my-campaign-detail.html',
  styleUrl: './my-campaign-detail.scss',
})
export class MyCampaignDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly userCampaignsService = inject(UserCampaignsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly translationService = inject(TranslationService);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly campaign = signal<MyCampaign | undefined>(undefined);
  private readonly now = signal(Date.now());

  private readonly campaignId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly live = computed((): UserCampaignLiveSnapshot | null => {
    const campaign = this.campaign();
    if (!campaign) {
      return null;
    }

    return userCampaignLiveSnapshot(
      {
        createdAt: campaign.createdAt,
        endDate: campaign.endDate,
        status: campaign.status,
        budget: campaign.minBudget,
        cpm: campaign.cpm,
        epc: campaign.epc,
        ctr: campaign.ctr,
        participation: campaign.participation ?? 0,
        riskMode: campaign.riskMode ?? 0,
        riskSpent: campaign.riskSpent ?? 0,
        riskImpressions: campaign.riskImpressions ?? 0,
        riskClicks: campaign.riskClicks ?? 0,
        riskRevenue: campaign.riskRevenue ?? 0,
      },
      this.now(),
    );
  });

  constructor() {
    effect((onCleanup) => {
      const clock = interval(1000).subscribe(() => this.now.set(Date.now()));
      onCleanup(() => clock.unsubscribe());
    });

    effect((onCleanup) => {
      const id = this.campaignId();
      if (!id) {
        this.campaign.set(undefined);
        this.loading.set(false);
        this.loadError.set(false);
        return;
      }

      this.loading.set(true);
      this.loadError.set(false);

      const sub = forkJoin({
        enrollment: this.userCampaignsService.getById(id),
        categories: this.categoriesService.getAll(),
      }).subscribe({
        next: ({ enrollment, categories }) => {
          const categoryName =
            categories.find((category) => category.id === enrollment.campaign.category_id)?.name ??
            '';
          this.campaign.set(toMyCampaign(enrollment, categoryName));
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.campaign.set(undefined);
          this.loading.set(false);
          this.loadError.set(!(error instanceof HttpErrorResponse && error.status === 404));
        },
      });

      const pollSub = interval(STATS_POLL_MS)
        .pipe(
          switchMap(() =>
            this.userCampaignsService.getById(id).pipe(catchError(() => of(null))),
          ),
        )
        .subscribe((enrollment) => {
          if (!enrollment) {
            return;
          }

          this.campaign.set(toMyCampaign(enrollment, this.campaign()?.categoryName ?? ''));
        });

      onCleanup(() => {
        sub.unsubscribe();
        pollSub.unsubscribe();
      });
    });
  }

  protected statusLabelKey(status: MyCampaignStatus): string {
    return `app.myCampaigns.tabs.${status}`;
  }

  protected countryFlagUrl(iso: string): string {
    return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
  }

  protected formatBudget(amount: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  protected formatMoney(amount: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  protected formatPercent(value: number): string {
    return `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}%`;
  }

  protected formatInteger(value: number): string {
    return new Intl.NumberFormat(undefined).format(value);
  }

  protected formatDateTime(date: Date | null): string {
    this.translationService.activeLanguage();
    if (!date) {
      return '—';
    }

    const locale = localeForLanguage(this.translationService.activeLanguage());
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
