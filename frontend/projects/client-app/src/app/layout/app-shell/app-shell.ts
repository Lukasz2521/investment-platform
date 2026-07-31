import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/services/auth.service';
import { SessionTimeoutService } from '../../core/auth/services/session-timeout.service';
import { LanguageSelector } from '../../core/i18n/components/language-selector/language-selector';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { ThemeService } from '../../core/theme/theme.service';

type NavIcon = 'home' | 'user' | 'bank' | 'receipt' | 'pencil' | 'globeDollar' | 'unlock';

@Component({
  selector: 'app-app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LanguageSelector],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  host: {
    '[class.app-shell--light]': 'themeService.mode() === "light"',
  },
})
export class AppShell implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly sessionTimeoutService = inject(SessionTimeoutService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly themeService = inject(ThemeService);
  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly sideMenuOpen = signal(false);

  protected readonly navItems: { labelKey: string; route: string; icon: NavIcon }[] = [
    { labelKey: 'app.nav.dashboard', route: APP_ROUTE_PATHS.dashboard, icon: 'home' },
    { labelKey: 'app.nav.finance', route: APP_ROUTE_PATHS.deposit, icon: 'bank' },
    { labelKey: 'app.nav.transactions', route: APP_ROUTE_PATHS.transactions, icon: 'receipt' },
    {
      labelKey: 'app.nav.campaignCreator',
      route: APP_ROUTE_PATHS.campaignCreator,
      icon: 'pencil',
    },
    { labelKey: 'app.nav.markets', route: APP_ROUTE_PATHS.markets, icon: 'globeDollar' },
    { labelKey: 'app.nav.profile', route: APP_ROUTE_PATHS.profile, icon: 'user' },
    { labelKey: 'app.nav.changePassword', route: APP_ROUTE_PATHS.changePassword, icon: 'unlock' },
  ];

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.sessionTimeoutService.start();
    });
  }

  ngOnDestroy(): void {
    this.sessionTimeoutService.stop();
  }

  protected toggleSideMenu(): void {
    this.sideMenuOpen.update((open) => !open);
  }

  protected closeSideMenu(): void {
    this.sideMenuOpen.set(false);
  }

  protected logout(): void {
    this.closeSideMenu();
    this.sessionTimeoutService.stop();
    this.authService.forceLogout();
  }
}
