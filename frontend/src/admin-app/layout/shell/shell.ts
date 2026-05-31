import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';

import { ThemeService } from '../../core/theme/theme.service';
import { APP_NAV_ITEMS } from '../../core/routing/app-nav-items';
import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { UserPublic } from '../../core/users/models/user.model';
import { UsersService } from '../../core/users/services/users.service';
import {
  getUserDisplayName,
  getUserInitials,
} from '../../core/users/utils/user-display.utils';

@Component({
  selector: 'admin-app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, Avatar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly themeService = inject(ThemeService);
  private readonly usersService = inject(UsersService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly navItems = APP_NAV_ITEMS;
  protected readonly appRoutePaths = APP_ROUTE_PATHS;
  protected readonly sidebarCollapsed = signal(false);
  protected readonly currentUser = signal<UserPublic | null>(null);

  protected readonly userDisplayName = computed(() => getUserDisplayName(this.currentUser()));
  protected readonly userInitials = computed(() => getUserInitials(this.currentUser()));

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.usersService.getCurrentUser().subscribe({
        next: (user) => this.currentUser.set(user),
      });
    });
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }
}
