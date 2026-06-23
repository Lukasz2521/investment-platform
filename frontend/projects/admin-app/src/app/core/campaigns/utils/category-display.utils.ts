import { CategoryPublic } from '../models/category.model';

export type CategoryTableRow = CategoryPublic & {
  parent_category_name: string;
};

export function mapCategoriesForTable(categories: CategoryPublic[]): CategoryTableRow[] {
  return categories.map((category) => ({
    ...category,
    parent_category_name: '-',
  }));
}
