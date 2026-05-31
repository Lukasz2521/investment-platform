import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';

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
export class Shell {
  protected readonly themeService = inject(ThemeService);

  protected readonly appRoutePaths = APP_ROUTE_PATHS;
  protected readonly sidebarCollapsed = signal(false);

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }
}
