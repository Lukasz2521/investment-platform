import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../../../core/routing/app-route-paths';
import {
  PARTNERSHIP_CATEGORIES,
  PartnershipCategory,
} from '../../partnership-categories';
import { PARTNERSHIP_PROJECTS } from '../../partnerships-projects';

@Component({
  selector: 'app-partnerships-grid',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './partnerships-grid.html',
  styleUrl: './partnerships-grid.scss',
})
export class PartnershipsGrid {
  protected readonly routes = APP_ROUTE_PATHS;

  protected readonly categories = PARTNERSHIP_CATEGORIES;

  protected readonly activeCategory = signal<PartnershipCategory>('all');

  protected readonly filteredProjects = computed(() => {
    const category = this.activeCategory();

    if (category === 'all') {
      return PARTNERSHIP_PROJECTS;
    }

    return PARTNERSHIP_PROJECTS.filter((project) => project.category === category);
  });

  protected setCategory(category: PartnershipCategory): void {
    this.activeCategory.set(category);
  }
}
