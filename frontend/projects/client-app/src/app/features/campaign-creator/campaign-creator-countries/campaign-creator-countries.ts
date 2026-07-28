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
import {
  CAMPAIGN_COUNTRIES,
  CAMPAIGN_COUNTRY_ISO_BY_NAME,
  CAMPAIGN_COUNTRY_NAME_BY_ISO,
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

  readonly selectedCountries = input.required<string[]>();
  readonly selectedCountriesChange = output<string[]>();

  private readonly searchRef = viewChild.required<ElementRef<HTMLElement>>('countrySearch');
  private readonly mapHost = viewChild<ElementRef<HTMLElement>>('mapHost');

  protected readonly countries = CAMPAIGN_COUNTRIES;
  protected readonly query = signal('');
  protected readonly menuOpen = signal(false);
  protected readonly mapHtml = signal<SafeHtml | null>(null);
  protected readonly mapReady = signal(false);

  protected readonly filteredCountries = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return this.countries;
    }

    return this.countries.filter((country) => country.toLowerCase().includes(q));
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

      requestAnimationFrame(() => this.syncMapSelection());
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

  protected isSelected(country: string): boolean {
    return this.selectedCountries().includes(country);
  }

  protected onCountryCheckbox(country: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const selected = this.selectedCountries();

    if (checked && !selected.includes(country)) {
      this.selectedCountriesChange.emit([...selected, country]);
      return;
    }

    if (!checked && selected.includes(country)) {
      this.selectedCountriesChange.emit(selected.filter((item) => item !== country));
    }
  }

  protected toggleCountry(country: string): void {
    const selected = this.selectedCountries();
    const next = selected.includes(country)
      ? selected.filter((item) => item !== country)
      : [...selected, country];

    this.selectedCountriesChange.emit(next);
  }

  protected removeCountry(country: string): void {
    this.selectedCountriesChange.emit(
      this.selectedCountries().filter((item) => item !== country),
    );
  }

  protected onMapClick(event: MouseEvent): void {
    const code = this.findCountryCode(event.target as Element | null);
    if (!code) {
      return;
    }

    const name = CAMPAIGN_COUNTRY_NAME_BY_ISO[code];
    if (!name) {
      return;
    }

    this.toggleCountry(name);
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

    for (const name of this.selectedCountries()) {
      const iso = CAMPAIGN_COUNTRY_ISO_BY_NAME[name];
      if (!iso) {
        continue;
      }

      const el = svg.getElementById(iso);
      if (!el) {
        continue;
      }

      this.markSelected(el);
    }
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
