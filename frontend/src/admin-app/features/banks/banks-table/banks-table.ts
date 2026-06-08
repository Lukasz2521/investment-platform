import { Component, input, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { BankPublic } from '../../../core/banks/models/bank.model';

@Component({
  selector: 'admin-app-banks-table',
  imports: [TableModule, IconField, InputIcon, InputText, Button],
  templateUrl: './banks-table.html',
  styleUrl: './banks-table.scss',
})
export class BanksTable {
  private readonly banksTable = viewChild<Table>('banksTable');

  readonly banks = input.required<BankPublic[]>();
  readonly loading = input(false);

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.banksTable()?.filterGlobal(value, 'contains');
  }

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }

  protected getBankInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
}
