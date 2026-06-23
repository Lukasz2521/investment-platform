import { DecimalPipe } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { TransactionTableRow } from '../../../core/transactions/utils/transaction-display.utils';

@Component({
  selector: 'admin-app-transactions-delete-dialog',
  imports: [DecimalPipe, Dialog, Button],
  templateUrl: './transactions-delete-dialog.html',
  styleUrl: './transactions-delete-dialog.scss',
})
export class TransactionsDeleteDialog {
  readonly visible = model(false);
  readonly transaction = input<TransactionTableRow | null>(null);
  readonly deleting = input(false);

  readonly confirm = output<void>();

  protected onCancel(): void {
    this.visible.set(false);
  }
}
