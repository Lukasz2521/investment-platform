import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';

import {
  CreateTransaction,
  TRANSACTION_CURRENCY_OPTIONS,
  TRANSACTION_STATUS_OPTIONS,
  CREATE_TRANSACTION_TYPE_OPTIONS,
  TransactionPublic,
  TransactionStatus,
  TransactionType,
} from '../../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../../core/transactions/services/transactions.service';
import { UserPublic } from '../../../core/users/models/user.model';

@Component({
  selector: 'admin-app-transactions-create-dialog',
  imports: [ReactiveFormsModule, Dialog, Button, InputText, Select],
  templateUrl: './transactions-create-dialog.html',
  styleUrl: './transactions-create-dialog.scss',
})
export class TransactionsCreateDialog {
  private readonly transactionsService = inject(TransactionsService);
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = model(false);
  readonly users = input<UserPublic[]>([]);

  readonly transactionCreated = output<TransactionPublic>();

  protected readonly submitting = signal(false);
  protected readonly typeOptions = [...CREATE_TRANSACTION_TYPE_OPTIONS];
  protected readonly statusOptions = [...TRANSACTION_STATUS_OPTIONS];
  protected readonly currencyOptions = [...TRANSACTION_CURRENCY_OPTIONS];

  protected readonly userOptions = signal<{ label: string; value: string }[]>([]);

  protected readonly form = this.formBuilder.group({
    amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,4})?$/)]],
    currency: ['EUR', Validators.required],
    transaction_type: [TransactionType.Deposit, Validators.required],
    status: [TransactionStatus.Pending, Validators.required],
    user_id: [null as string | null, Validators.required],
    description: [''],
  });

  private wasVisible = false;

  constructor() {
    effect(() => {
      this.userOptions.set(
        this.users().map((user) => ({
          label: this.formatUserLabel(user),
          value: user.id,
        })),
      );
    });

    effect(() => {
      const isVisible = this.visible();
      if (isVisible && !this.wasVisible) {
        this.resetForm();
      }
      this.wasVisible = isVisible;
    });
  }

  protected closeDialog(): void {
    this.resetForm();
    this.visible.set(false);
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.user_id) {
      return;
    }

    const payload: CreateTransaction = {
      amount: value.amount?.trim() ?? '',
      transaction_type: value.transaction_type!,
      status: value.status!,
      user_id: value.user_id,
      description: value.description?.trim() || null,
    };

    this.submitting.set(true);
    this.transactionsService.create(payload).subscribe({
      next: (transaction) => {
        this.transactionCreated.emit(transaction);
        this.closeDialog();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  private resetForm(): void {
    this.form.reset({
      amount: '',
      currency: 'EUR',
      transaction_type: TransactionType.Deposit,
      status: TransactionStatus.Pending,
      user_id: null,
      description: '',
    });
  }

  private formatUserLabel(user: UserPublic): string {
    if (user.full_name?.trim()) {
      return user.full_name.trim();
    }

    const name = `${user.name} ${user.last_name}`.trim();
    return name || user.email;
  }
}
