import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LanguageSelector } from '../../core/i18n/components/language-selector/language-selector';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { ThemeService } from '../../core/theme/theme.service';

type NavIcon = 'home' | 'user' | 'bank';

@Component({
  selector: 'app-app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LanguageSelector],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  host: {
    '[class.app-shell--light]': 'themeService.mode() === "light"',
  },
})
export class AppShell {
  protected readonly themeService = inject(ThemeService);
  protected readonly routes = APP_ROUTE_PATHS;
  protected readonly sideMenuOpen = signal(false);

  protected readonly navItems: { labelKey: string; route: string; icon: NavIcon }[] = [
    { labelKey: 'app.nav.dashboard', route: APP_ROUTE_PATHS.dashboard, icon: 'home' },
    { labelKey: 'app.nav.finance', route: APP_ROUTE_PATHS.deposit, icon: 'bank' },
    { labelKey: 'app.nav.profile', route: APP_ROUTE_PATHS.profile, icon: 'user' },
  ];

  protected toggleSideMenu(): void {
    this.sideMenuOpen.update((open) => !open);
  }

  protected closeSideMenu(): void {
    this.sideMenuOpen.set(false);
  }
}
