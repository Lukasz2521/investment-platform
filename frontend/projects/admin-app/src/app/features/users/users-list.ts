import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Card } from 'primeng/card';
import { Toolbar } from 'primeng/toolbar';

import { AppRoutingService } from '../../core/routing/app-routing.service';
import { UserPublic } from '../../core/users/models/user.model';
import { UsersService } from '../../core/users/services/users.service';
import { UsersTable } from './users-table/users-table';

@Component({
  selector: 'admin-app-users-list',
  imports: [Toolbar, Card, UsersTable],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList {
  private readonly usersService = inject(UsersService);
  private readonly appRouting = inject(AppRoutingService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly loading = signal(true);
  protected readonly users = signal<UserPublic[]>([]);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.loading.set(false);
        return;
      }

      this.loadUsers();
    });
  }

  private loadUsers(): void {
    this.usersService.getAll().subscribe({
      next: ({ data }) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected viewUser(userId: string): void {
    this.appRouting.navigateToUser(userId);
  }
}
