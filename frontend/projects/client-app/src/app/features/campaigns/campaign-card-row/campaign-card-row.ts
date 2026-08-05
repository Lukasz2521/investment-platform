import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-campaign-card-row',
  templateUrl: './campaign-card-row.html',
  styleUrl: './campaign-card-row.scss',
  host: {
    '[style.--campaign-cards-visible]': 'visibleCount()',
  },
})
export class CampaignCardRow implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly visibleCount = input(3, { transform: numberAttribute });

  private readonly scrollRef = viewChild.required<ElementRef<HTMLElement>>('scroll');

  protected readonly thumbWidth = signal(100);
  protected readonly thumbOffset = signal(0);
  protected readonly canScroll = signal(false);

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
