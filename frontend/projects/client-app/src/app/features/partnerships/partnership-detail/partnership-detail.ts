import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TranslatePipe } from '../../../core/i18n/pipes/translate.pipe';
import { APP_ROUTE_PATHS } from '../../../core/routing/app-route-paths';
import {
  getAdjacentPartnershipProjects,
  getPartnershipProject,
} from '../partnerships-projects';

@Component({
  selector: 'app-partnership-detail',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './partnership-detail.html',
  styleUrl: './partnership-detail.scss',
})
export class PartnershipDetail {
  private readonly route = inject(ActivatedRoute);

  protected readonly routes = APP_ROUTE_PATHS;

  private readonly projectId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null },
  );

  protected readonly project = computed(() => {
    const id = this.projectId();

    if (!id) {
      return undefined;
    }

    return getPartnershipProject(id);
  });

  protected readonly nextProject = computed(() => {
    const id = this.projectId();

    if (!id) {
      return undefined;
    }

    return getAdjacentPartnershipProjects(id).next;
  });
}
