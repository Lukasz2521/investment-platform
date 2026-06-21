import { Component, effect, inject, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';

import { CategoryPublic } from '../../../core/campaigns/models/category.model';
import { CategoriesService } from '../../../core/campaigns/services/categories.service';

@Component({
  selector: 'admin-app-categories-create-dialog',
  imports: [ReactiveFormsModule, Dialog, Button, InputText],
  templateUrl: './categories-create-dialog.html',
  styleUrl: './categories-create-dialog.scss',
})
export class CategoriesCreateDialog {
  private readonly categoriesService = inject(CategoriesService);
  private readonly formBuilder = inject(FormBuilder);

  readonly visible = model(false);

  readonly categoryCreated = output<CategoryPublic>();

  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S+/)]],
  });

  private wasVisible = false;

  constructor() {
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

    const name = this.form.controls.name.value.trim();
    this.submitting.set(true);

    this.categoriesService.create({ name }).subscribe({
      next: (category) => {
        this.categoryCreated.emit(category);
        this.closeDialog();
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  private resetForm(): void {
    this.form.reset({ name: '' });
  }
}
