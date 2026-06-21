import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
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
  readonly category = input<CategoryPublic | null>(null);

  readonly categorySaved = output<CategoryPublic>();

  protected readonly submitting = signal(false);
  protected readonly isEditMode = computed(() => this.category() !== null);
  protected readonly dialogHeader = computed(() =>
    this.isEditMode() ? 'Edit Category' : 'Create Category',
  );

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S+/)]],
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        return;
      }

      const category = this.category();
      if (category) {
        this.form.patchValue({ name: category.name });
      } else {
        this.resetForm();
      }
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
    const category = this.category();
    this.submitting.set(true);

    const request$ = category
      ? this.categoriesService.update(category.id, { name })
      : this.categoriesService.create({ name });

    request$.subscribe({
      next: (savedCategory) => {
        this.categorySaved.emit(savedCategory);
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
