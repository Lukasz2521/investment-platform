import { Component, effect, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { BankPublic } from '../../../core/banks/models/bank.model';

@Component({
  selector: 'admin-app-banks-delete-dialog',
  imports: [Dialog, Button],
  templateUrl: './banks-delete-dialog.html',
  styleUrl: './banks-delete-dialog.scss',
})
export class BanksDeleteDialog {
  readonly visible = model(false);
  readonly bank = input<BankPublic | null>(null);
  readonly deleting = input(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected onCancel(): void {
    this.visible.set(false);
  }
}
