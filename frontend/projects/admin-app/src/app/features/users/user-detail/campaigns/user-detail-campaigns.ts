import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { UserCampaignPublic, UserCampaignStatus } from '../../../../core/campaigns/models/user-campaign.model';
import { UserCampaignsService } from '../../../../core/campaigns/services/user-campaigns.service';
import { liveRiskSnapshot, riskTargetText } from './campaign-risk';

type UserCampaignTableRow = {
  id: string;
  title: string;
  status: UserCampaignStatus;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  cpm: number;
  epc: number;
  ctr: number;
  participation: number;
  created_at: string | null;
  risk_mode: number;
  riskTarget: string;
};

@Component({
  selector: 'admin-app-user-detail-campaigns',
  imports: [DatePipe, DecimalPipe, TableModule, IconField, InputIcon, InputText, Button],
  templateUrl: './user-detail-campaigns.html',
  styleUrl: './user-detail-campaigns.scss',
})
export class UserDetailCampaigns implements OnDestroy {
  private readonly userCampaignsService = inject(UserCampaignsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly campaignsTable = viewChild<Table>('campaignsTable');
  private readonly sources = signal<UserCampaignPublic[]>([]);
  private readonly now = signal(Date.now());
  private clock: ReturnType<typeof setInterval> | null = null;

  readonly userId = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly savingId = signal<string | null>(null);
  protected readonly riskError = signal('');
  protected readonly riskDrafts = signal<Record<string, string>>({});
  protected readonly campaigns = computed(() => this.sources().map((campaign) => this.toRow(campaign)));
  protected readonly liveById = computed(() => {
    const now = this.now();
    return Object.fromEntries(
      this.sources().map((campaign) => [campaign.id, this.liveOf(campaign, now)]),
    );
  });

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.clock = setInterval(() => this.now.set(Date.now()), 1000);

      const userId = this.userId();
      if (!userId) {
        this.loading.set(false);
        return;
      }

      this.loadCampaigns(userId);
    });
  }

  ngOnDestroy(): void {
    if (this.clock !== null) {
      clearInterval(this.clock);
    }
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.campaignsTable()?.filterGlobal(value, 'contains');
  }

  protected onRiskInput(id: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.riskDrafts.update((drafts) => ({ ...drafts, [id]: value }));
  }

  protected saveRisk(row: UserCampaignTableRow): void {
    if (row.status !== 'active' || this.savingId()) {
      return;
    }

    const raw = (this.riskDrafts()[row.id] ?? '').trim();
    const riskMode = raw === '' ? 0 : Number(raw);
    if (!Number.isInteger(riskMode) || riskMode < 0 || riskMode > 10000) {
      this.riskError.set('Risk mode must be a whole number from 0 to 10000.');
      return;
    }

    this.riskError.set('');
    this.savingId.set(row.id);
    this.userCampaignsService.setRiskMode(row.id, riskMode).subscribe({
      next: (updated) => {
        this.sources.update((campaigns) =>
          campaigns.map((campaign) => (campaign.id === updated.id ? updated : campaign)),
        );
        this.riskDrafts.update((drafts) => ({
          ...drafts,
          [updated.id]: updated.risk_mode > 0 ? String(updated.risk_mode) : '',
        }));
        this.savingId.set(null);
      },
      error: () => {
        this.riskError.set('Could not save risk mode.');
        this.savingId.set(null);
      },
    });
  }

  private loadCampaigns(userId: string): void {
    this.loading.set(true);

    this.userCampaignsService.getByUserId(userId, 0, 100).subscribe({
      next: (page) => {
        if (page.count <= page.data.length) {
          this.setSources(page.data);
          this.loading.set(false);
          return;
        }

        this.userCampaignsService.getByUserId(userId, 0, page.count).subscribe({
          next: (fullPage) => {
            this.setSources(fullPage.data);
            this.loading.set(false);
          },
          error: () => {
            this.setSources(page.data);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.sources.set([]);
        this.loading.set(false);
      },
    });
  }

  private setSources(campaigns: UserCampaignPublic[]): void {
    this.sources.set(campaigns);
    this.riskDrafts.set(
      Object.fromEntries(
        campaigns.map((campaign) => [
          campaign.id,
          campaign.risk_mode > 0 ? String(campaign.risk_mode) : '',
        ]),
      ),
    );
  }

  private liveOf(campaign: UserCampaignPublic, now: number) {
    return liveRiskSnapshot(
      {
        createdAt: campaign.created_at,
        endDate: campaign.end_date,
        budget: this.toNumber(campaign.budget),
        cpm: this.toNumber(campaign.cpm),
        epc: this.toNumber(campaign.epc),
        ctr: this.toNumber(campaign.ctr),
        participation: campaign.participation,
        riskMode: campaign.risk_mode ?? 0,
        riskSpent: this.toNumber(campaign.risk_spent),
        riskImpressions: campaign.risk_impressions ?? 0,
        riskClicks: campaign.risk_clicks ?? 0,
        riskRevenue: this.toNumber(campaign.risk_revenue),
      },
      now,
    );
  }

  private toRow(campaign: UserCampaignPublic): UserCampaignTableRow {
    return {
      id: campaign.id,
      title: campaign.campaign.title,
      status: campaign.status,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      budget: this.toNumber(campaign.budget),
      currency: campaign.campaign.currency,
      cpm: this.toNumber(campaign.cpm),
      epc: this.toNumber(campaign.epc),
      ctr: this.toNumber(campaign.ctr),
      participation: campaign.participation,
      created_at: campaign.created_at,
      risk_mode: campaign.risk_mode ?? 0,
      riskTarget: riskTargetText(campaign.risk_mode ?? 0),
    };
  }

  private toNumber(value: string | number | null | undefined): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
