import { Component, input, output, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';

import { NewsPublic } from '../../../core/news/models/news.model';

@Component({
  selector: 'admin-app-news-table',
  imports: [TableModule, IconField, InputIcon, InputText, Button],
  templateUrl: './news-table.html',
  styleUrl: './news-table.scss',
})
export class NewsTable {
  private readonly newsTable = viewChild<Table>('newsTable');

  readonly items = input.required<NewsPublic[]>();
  readonly loading = input(false);

  readonly editItem = output<NewsPublic>();
  readonly deleteItem = output<NewsPublic>();

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newsTable()?.filterGlobal(value, 'contains');
  }

  protected onEditClick(item: NewsPublic, event: Event): void {
    event.stopPropagation();
    this.editItem.emit(item);
  }

  protected onDeleteClick(item: NewsPublic, event: Event): void {
    event.stopPropagation();
    this.deleteItem.emit(item);
  }

  protected formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) {
      return value;
    }

    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
