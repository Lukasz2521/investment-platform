import { DatePipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';

import { UserPublic } from '../../core/users/models/user.model';
import { UsersService } from '../../core/users/services/users.service';

@Component({
  selector: 'admin-app-dashboard',
  imports: [
    DatePipe,
    TableModule,
    Toolbar,
    Card,
    IconField,
    InputIcon,
    InputText,
    Button,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly usersService = inject(UsersService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly usersTable = viewChild<Table>('usersTable');

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
      next: (response) => {
        this.users.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.usersTable()?.filterGlobal(value, 'contains');
  }

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }

  protected roleLabel(isSuperuser: boolean): string {
    return isSuperuser ? 'admin' : 'user';
  }
}
