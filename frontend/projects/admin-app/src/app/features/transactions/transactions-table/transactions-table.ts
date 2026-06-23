import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output, viewChild } from '@angular/core';
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

  readonly deleteTransaction = output<TransactionTableRow>();
  readonly editTransaction = output<TransactionTableRow>();

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.transactionsTable()?.filterGlobal(value, 'contains');
  }

  protected displayValue(value: string | null | undefined): string {
    return value?.trim() ? value : '-';
  }

  protected onEditClick(transaction: TransactionTableRow, event: Event): void {
    event.stopPropagation();
    this.editTransaction.emit(transaction);
  }

  protected onDeleteClick(transaction: TransactionTableRow, event: Event): void {
    event.stopPropagation();
    this.deleteTransaction.emit(transaction);
  }
}
