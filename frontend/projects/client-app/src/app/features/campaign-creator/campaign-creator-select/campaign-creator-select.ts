import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { CAMPAIGN_OPTIONS, CampaignOption } from '../campaign-options';

@Component({
  selector: 'app-campaign-creator-select',
  imports: [TranslatePipe],
  templateUrl: './campaign-creator-select.html',
  styleUrl: './campaign-creator-select.scss',
})
export class CampaignCreatorSelect implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly selectedCampaignId = input<string | null>(null);
  readonly campaignSelected = output<CampaignOption>();

  private readonly scrollRef = viewChild.required<ElementRef<HTMLElement>>('scroll');

  protected readonly campaigns = CAMPAIGN_OPTIONS;
  protected readonly thumbWidth = signal(100);
  protected readonly thumbOffset = signal(0);
  protected readonly canScroll = signal(false);
  protected readonly infoCampaignId = signal<string | null>(null);

  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    afterNextRender(() => {
      const scrollEl = this.scrollRef().nativeElement;
      this.syncScrollbar();

      this.resizeObserver = new ResizeObserver(() => this.syncScrollbar());
      this.resizeObserver.observe(scrollEl);
      this.resizeObserver.observe(this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected onScroll(): void {
    this.syncScrollbar();
  }

  protected onTrackClick(event: MouseEvent): void {
    const scrollEl = this.scrollRef().nativeElement;
    const track = event.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;

    scrollEl.scrollTo({ left: ratio * maxScroll, behavior: 'smooth' });
  }

  protected selectCampaign(campaign: CampaignOption): void {
    this.campaignSelected.emit(campaign);
  }

  protected openInfo(campaignId: string): void {
    this.infoCampaignId.set(campaignId);
  }

  protected closeInfo(): void {
    this.infoCampaignId.set(null);
  }

  protected formatBudget(campaign: CampaignOption): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: campaign.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(campaign.minBudget);
  }

  protected formatMetricMoney(value: number, currency: string): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  protected formatPercent(value: number): string {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  protected membershipPlanLabelKey(plan: CampaignOption['membershipPlan']): string {
    return `app.campaignCreator.select.plans.${plan}`;
  }

  private syncScrollbar(): void {
    const scrollEl = this.scrollRef().nativeElement;
    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
    const scrollable = maxScroll > 1;

    this.canScroll.set(scrollable);

    if (!scrollable) {
      this.thumbWidth.set(100);
      this.thumbOffset.set(0);
      return;
    }

    const widthPercent = Math.max((scrollEl.clientWidth / scrollEl.scrollWidth) * 100, 12);
    const maxOffset = 100 - widthPercent;
    const offsetPercent = (scrollEl.scrollLeft / maxScroll) * maxOffset;

    this.thumbWidth.set(widthPercent);
    this.thumbOffset.set(offsetPercent);
  }
}
