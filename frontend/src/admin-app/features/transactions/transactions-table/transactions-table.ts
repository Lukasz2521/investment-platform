import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { TransactionTableRow } from '../../../core/transactions/utils/transaction-display.utils';

@Component({
  selector: 'admin-app-transactions-table',
  imports: [DatePipe, DecimalPipe, TableModule, IconField, InputIcon, InputText, Button],
  templateUrl: './transactions-table.html',
})
export class TransactionsTable {
  private readonly transactionsTable = viewChild<Table>('transactionsTable');

  readonly transactions = input.required<TransactionTableRow[]>();
  readonly loading = input(false);

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.transactionsTable()?.filterGlobal(value, 'contains');
  }

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }
}
