import { DatePipe } from '@angular/common';
import { Component, input, output, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { UserPublic } from '../../../core/users/models/user.model';
import { getUserAccountTypeLabel, getUserRoleLabel } from '../../../core/users/utils/user-display.utils';

@Component({
  selector: 'admin-app-users-table',
  imports: [DatePipe, TableModule, IconField, InputIcon, InputText, Button],
  templateUrl: './users-table.html',
})
export class UsersTable {
  private readonly usersTable = viewChild<Table>('usersTable');

  readonly users = input.required<UserPublic[]>();
  readonly loading = input(false);

  readonly viewUser = output<string>();

  protected readonly getUserRoleLabel = getUserRoleLabel;
  protected readonly getUserAccountTypeLabel = getUserAccountTypeLabel;

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.usersTable()?.filterGlobal(value, 'contains');
  }

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }
}
