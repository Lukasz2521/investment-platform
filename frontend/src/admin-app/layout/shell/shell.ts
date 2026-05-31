import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';

import { APP_NAV_ITEMS } from '../../core/routing/app-nav-items';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

@Component({
  selector: 'admin-app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly navItems = APP_NAV_ITEMS;
  protected readonly appRoutePaths = APP_ROUTE_PATHS;
  protected readonly sidebarCollapsed = signal(false);

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }
}
