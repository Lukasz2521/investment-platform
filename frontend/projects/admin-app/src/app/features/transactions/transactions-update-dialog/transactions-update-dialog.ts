import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';

import {
  TRANSACTION_STATUS_OPTIONS,
  TransactionPublic,
  TransactionStatus,
  toTransactionStatus,
  UpdateTransaction,
} from '../../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../../core/transactions/services/transactions.service';
import { TransactionTableRow } from '../../../core/transactions/utils/transaction-display.utils';

@Component({
  selector: 'admin-app-transactions-update-dialog',
  imports: [ReactiveFormsModule, Dialog, Button, Select],
  templateUrl: './transactions-update-dialog.html',
  styleUrl: './transactions-update-dialog.scss',
})
export class TransactionsUpdateDialog {
  private readonly transactionsService = inject(TransactionsService);
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = model(false);
  readonly transaction = input<TransactionTableRow | null>(null);

  readonly transactionUpdated = output<TransactionPublic>();

  protected readonly submitting = signal(false);
  protected readonly statusOptions = [...TRANSACTION_STATUS_OPTIONS];

  protected readonly form = this.formBuilder.group({
    status: [TransactionStatus.Pending, Validators.required],
    description: [''],
  });

  private wasVisible = false;

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      if (isVisible && !this.wasVisible) {
        this.patchFormFromTransaction(this.transaction());
      }
      this.wasVisible = isVisible;
    });
  }

  protected closeDialog(): void {
    this.visible.set(false);
  }

  protected submit(): void {
    const transaction = this.transaction();
    if (!transaction || this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: UpdateTransaction = {
      status: value.status!,
      description: value.description?.trim() || null,
    };

    this.submitting.set(true);
    this.transactionsService.update(transaction.id, payload).subscribe({
      next: (updatedTransaction) => {
        this.transactionUpdated.emit(updatedTransaction);
        this.closeDialog();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  private patchFormFromTransaction(transaction: TransactionTableRow | null): void {
    if (!transaction) {
      return;
    }

    this.form.reset({
      status: toTransactionStatus(transaction.status),
      description: transaction.description ?? '',
    });
  }
}
