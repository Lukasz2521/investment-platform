import { Component, input, model, output } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

import { CategoryPublic } from '../../../core/campaigns/models/category.model';

@Component({
  selector: 'admin-app-categories-delete-dialog',
  imports: [Dialog, Button],
  templateUrl: './categories-delete-dialog.html',
  styleUrl: './categories-delete-dialog.scss',
})
export class CategoriesDeleteDialog {
  readonly visible = model(false);
  readonly category = input<CategoryPublic | null>(null);
  readonly deleting = input(false);

  readonly confirm = output<void>();

  protected onCancel(): void {
    this.visible.set(false);
  }
}
