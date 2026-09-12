import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LanguageSelector } from '../../core/i18n/components/language-selector/language-selector';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { LEGAL_DOCUMENTS } from '../../core/legal/legal-documents';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

const DESKTOP_NAV_MIN_WIDTH = 1025;

@Component({
  selector: 'app-marketing-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LanguageSelector],
  templateUrl: './marketing-shell.html',
  styleUrl: './marketing-shell.scss',
  host: {
    '[class.marketing-shell--menu-open]': 'sideMenuOpen()',
  },
})
export class MarketingShell implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly legalDocuments = LEGAL_DOCUMENTS;
  protected readonly sideMenuOpen = signal(false);

  protected readonly navItems = [
    { labelKey: 'marketing.nav.company', route: APP_ROUTE_PATHS.company },
    { labelKey: 'marketing.nav.partnerships', route: APP_ROUTE_PATHS.partnerships },
    { labelKey: 'marketing.nav.news', route: APP_ROUTE_PATHS.news },
    { labelKey: 'marketing.nav.contact', route: APP_ROUTE_PATHS.contact },
  ];

  private removeResizeListener: (() => void) | null = null;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const onResize = () => {
        if (window.innerWidth >= DESKTOP_NAV_MIN_WIDTH) {
          this.closeSideMenu();
        }
      };

      window.addEventListener('resize', onResize);
      this.removeResizeListener = () => window.removeEventListener('resize', onResize);
    });
  }

  ngOnDestroy(): void {
    this.removeResizeListener?.();
    this.setBodyScrollLocked(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeSideMenu();
  }

  protected toggleSideMenu(): void {
    this.sideMenuOpen.update((open) => !open);
    this.setBodyScrollLocked(this.sideMenuOpen());
  }

  protected closeSideMenu(): void {
    if (!this.sideMenuOpen()) {
      return;
    }

    this.sideMenuOpen.set(false);
    this.setBodyScrollLocked(false);
  }

  private setBodyScrollLocked(locked: boolean): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.body.style.overflow = locked ? 'hidden' : '';
  }
}
