import { Component, input, output, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { CategoryTableRow } from '../../../core/campaigns/utils/category-display.utils';

@Component({
  selector: 'admin-app-categories-table',
  imports: [TableModule, IconField, InputIcon, InputText, Button],
  templateUrl: './categories-table.html',
})
export class CategoriesTable {
  private readonly categoriesTable = viewChild<Table>('categoriesTable');

  readonly categories = input.required<CategoryTableRow[]>();
  readonly loading = input(false);

  readonly editCategory = output<CategoryTableRow>();
  readonly deleteCategory = output<CategoryTableRow>();

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.categoriesTable()?.filterGlobal(value, 'contains');
  }

  protected onEditClick(category: CategoryTableRow, event: Event): void {
    event.stopPropagation();
    this.editCategory.emit(category);
  }

  protected onDeleteClick(category: CategoryTableRow, event: Event): void {
    event.stopPropagation();
    this.deleteCategory.emit(category);
  }
}
