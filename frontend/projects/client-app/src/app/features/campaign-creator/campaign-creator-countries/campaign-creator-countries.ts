import { HttpClient } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { TranslationService } from '../../../core/i18n/services/translation.service';
import {
  BLOCKED_CAMPAIGN_MAP_CODES,
  BLOCKED_REGION_NAME_BY_CODE,
  CAMPAIGN_COUNTRY_LIST_CODES,
  CAMPAIGN_COUNTRY_NAME_BY_ISO,
  campaignCountryLabelKey,
  isBlockedCampaignCountry,
  isSelectableCampaignCountry,
} from '../campaign-country-codes';

@Component({
  selector: 'app-campaign-creator-countries',
  imports: [TranslatePipe],
  templateUrl: './campaign-creator-countries.html',
  styleUrl: './campaign-creator-countries.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CampaignCreatorCountries {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly translation = inject(TranslationService);

  readonly selectedCountries = input.required<string[]>();
  readonly selectedCountriesChange = output<string[]>();

  private readonly searchRef = viewChild.required<ElementRef<HTMLElement>>('countrySearch');
  private readonly mapHost = viewChild<ElementRef<HTMLElement>>('mapHost');

  protected readonly countryLabelKey = campaignCountryLabelKey;
  protected readonly query = signal('');
  protected readonly menuOpen = signal(false);
  protected readonly mapHtml = signal<SafeHtml | null>(null);
  protected readonly mapReady = signal(false);

  protected readonly filteredCountries = computed(() => {
    this.translation.activeLanguage();
    this.translation.translations();

    const q = this.query().trim().toLowerCase();
    const countries = [...CAMPAIGN_COUNTRY_LIST_CODES].sort((a, b) =>
      this.countryLabel(a).localeCompare(this.countryLabel(b), this.translation.activeLanguage()),
    );

    if (!q) {
      return countries;
    }

    return countries.filter((code) => {
      const label = this.countryLabel(code).toLowerCase();
      const english = (
        CAMPAIGN_COUNTRY_NAME_BY_ISO[code] ??
        BLOCKED_REGION_NAME_BY_CODE[code] ??
        ''
      ).toLowerCase();
      return label.includes(q) || english.includes(q) || code.includes(q);
    });
  });

  constructor() {
    afterNextRender(() => {
      this.http
        .get('/images/campaign-creator/world-map.svg', { responseType: 'text' })
        .subscribe({
          next: (svg) => {
            const cleaned = svg
              .replace(/<\?xml[\s\S]*?\?>/i, '')
              .replace(/<!DOCTYPE[\s\S]*?>/i, '')
              .replace(/\swidth="[^"]*"/, '')
              .replace(/\sheight="[^"]*"/, '');

            this.mapHtml.set(this.sanitizer.bypassSecurityTrustHtml(cleaned));
            this.mapReady.set(false);

            requestAnimationFrame(() => {
              this.mapReady.set(true);
              this.applyBlockedCountries();
              this.syncMapSelection();
            });
          },
        });
    });

    effect(() => {
      this.selectedCountries();
      if (!this.mapReady()) {
        return;
      }

      requestAnimationFrame(() => {
        this.applyBlockedCountries();
        this.syncMapSelection();
      });
    });
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) {
      return;
    }

    const target = event.target as Node | null;
    if (!target || this.searchRef().nativeElement.contains(target)) {
      return;
    }

    this.menuOpen.set(false);
  }

  protected onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.menuOpen.set(true);
  }

  protected openMenu(): void {
    this.menuOpen.set(true);
  }

  protected countryLabel(code: string): string {
    return this.translation.translate(campaignCountryLabelKey(code));
  }

  protected isBlocked(code: string): boolean {
    return isBlockedCampaignCountry(code);
  }

  protected isSelected(code: string): boolean {
    return this.selectedCountries().includes(code);
  }

  protected onCountryCheckbox(code: string, event: Event): void {
    const input = event.target as HTMLInputElement;

    if (isBlockedCampaignCountry(code)) {
      input.checked = false;
      return;
    }

    const checked = input.checked;
    const selected = this.selectedCountries();

    if (checked && !selected.includes(code)) {
      this.selectedCountriesChange.emit([...selected, code]);
      return;
    }

    if (!checked && selected.includes(code)) {
      this.selectedCountriesChange.emit(selected.filter((item) => item !== code));
    }
  }

  protected toggleCountry(code: string): void {
    if (isBlockedCampaignCountry(code)) {
      return;
    }

    const selected = this.selectedCountries();
    const next = selected.includes(code)
      ? selected.filter((item) => item !== code)
      : [...selected, code];

    this.selectedCountriesChange.emit(next);
  }

  protected removeCountry(code: string): void {
    this.selectedCountriesChange.emit(
      this.selectedCountries().filter((item) => item !== code),
    );
  }

  protected onMapClick(event: MouseEvent): void {
    const code = this.findCountryCode(event.target as Element | null);
    if (!code || !isSelectableCampaignCountry(code)) {
      return;
    }

    this.toggleCountry(code);
  }

  private findCountryCode(start: Element | null): string | null {
    const host = this.mapHost()?.nativeElement;
    let current: Element | null = start;

    while (current && current !== host) {
      const id = current.getAttribute('id');
      if (id && id !== 'world-map' && /^[a-z]{2}$/i.test(id)) {
        return id.toLowerCase();
      }
      current = current.parentElement;
    }

    return null;
  }

  private applyBlockedCountries(): void {
    const host = this.mapHost()?.nativeElement;
    const svg = host?.querySelector('svg');
    if (!svg) {
      return;
    }

    for (const iso of BLOCKED_CAMPAIGN_MAP_CODES) {
      const el = svg.getElementById(iso);
      if (!el) {
        continue;
      }

      this.markBlocked(el);
    }
  }

  private syncMapSelection(): void {
    const host = this.mapHost()?.nativeElement;
    if (!host) {
      return;
    }

    const svg = host.querySelector('svg');
    if (!svg) {
      return;
    }

    svg.querySelectorAll('.is-selected').forEach((el) => {
      el.classList.remove('is-selected');
      if (el instanceof SVGElement) {
        el.removeAttribute('data-selected');
      }
    });

    for (const iso of this.selectedCountries()) {
      if (isBlockedCampaignCountry(iso)) {
        continue;
      }

      const el = svg.getElementById(iso);
      if (!el) {
        continue;
      }

      this.markSelected(el);
    }
  }

  private markBlocked(el: Element): void {
    el.classList.add('is-blocked');
    el.setAttribute('data-blocked', 'true');
    el.setAttribute('aria-disabled', 'true');

    el.querySelectorAll('path').forEach((path) => {
      path.classList.add('is-blocked');
      path.setAttribute('data-blocked', 'true');
    });
  }

  private markSelected(el: Element): void {
    el.classList.add('is-selected');
    el.setAttribute('data-selected', 'true');

    el.querySelectorAll('path').forEach((path) => {
      path.classList.add('is-selected');
      path.setAttribute('data-selected', 'true');
    });
  }
}
