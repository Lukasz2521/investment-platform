import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';

import { SessionTimeoutService } from '../../core/auth/services/session-timeout.service';
import { ThemeService } from '../../core/theme/theme.service';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { ShellSidebar } from './shell-sidebar/shell-sidebar';
import { ShellTopbarActions } from './shell-topbar-actions/shell-topbar-actions';

@Component({
  selector: 'admin-app-shell',
  imports: [RouterOutlet, RouterLink, Button, ShellTopbarActions, ShellSidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell implements OnDestroy {
  protected readonly themeService = inject(ThemeService);
  private readonly sessionTimeoutService = inject(SessionTimeoutService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly appRoutePaths = APP_ROUTE_PATHS;
  protected readonly sidebarCollapsed = signal(false);

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

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }
}
