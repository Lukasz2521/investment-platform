import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { LanguageSelector } from '../../core/i18n/components/language-selector/language-selector';
import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { ThemeService } from '../../core/theme/theme.service';

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

  protected readonly navItems = [
    { labelKey: 'app.nav.dashboard', route: APP_ROUTE_PATHS.dashboard, icon: 'home' as const },
  ];

  protected toggleSideMenu(): void {
    this.sideMenuOpen.update((open) => !open);
  }

  protected closeSideMenu(): void {
    this.sideMenuOpen.set(false);
  }
}
