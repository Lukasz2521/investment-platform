import { Component, computed, signal } from '@angular/core';

import { TranslatePipe } from '../../../../core/i18n/pipes/translate.pipe';
import {
  PARTNERSHIP_CATEGORIES,
  PartnershipCategory,
} from '../../partnership-categories';
import { PARTNERSHIP_PROJECTS } from '../../partnerships-projects';

@Component({
  selector: 'app-partnerships-grid',
  imports: [TranslatePipe],
  templateUrl: './partnerships-grid.html',
  styleUrl: './partnerships-grid.scss',
})
export class PartnershipsGrid {
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
