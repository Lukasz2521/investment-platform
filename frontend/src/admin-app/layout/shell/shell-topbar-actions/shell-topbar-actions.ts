import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tag } from 'primeng/tag';

import { AuthService } from '../../../core/auth/services/auth.service';
import { SessionTimeoutService } from '../../../core/auth/services/session-timeout.service';
import { AppRoutingService } from '../../../core/routing/app-routing.service';
import { ThemeService } from '../../../core/theme/theme.service';
import { UserPublic } from '../../../core/users/models/user.model';
import { UsersService } from '../../../core/users/services/users.service';
import {
  getUserDisplayName,
  getUserInitials,
  getUserRoleLabel,
} from '../../../core/users/utils/user-display.utils';

@Component({
  selector: 'admin-app-shell-topbar-actions',
  imports: [Button, Avatar, Popover, Tag],
  templateUrl: './shell-topbar-actions.html',
  styleUrl: './shell-topbar-actions.scss',
  host: {
    class: 'shell-topbar-end',
  },
})
export class ShellTopbarActions {
  protected readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly sessionTimeoutService = inject(SessionTimeoutService);
  private readonly appRouting = inject(AppRoutingService);
  private readonly usersService = inject(UsersService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly userMenu = viewChild<Popover>('userMenu');

  protected readonly currentUser = signal<UserPublic | null>(null);
  protected readonly userDisplayName = computed(() => getUserDisplayName(this.currentUser()));
  protected readonly userInitials = computed(() => getUserInitials(this.currentUser()));
  protected readonly userRoleLabel = computed(() => getUserRoleLabel(this.currentUser()));

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

  protected logout(): void {
    this.userMenu()?.hide();
    this.sessionTimeoutService.stop();
    this.authService.logout();
    this.currentUser.set(null);
    this.appRouting.navigateToLogin();
  }
}
