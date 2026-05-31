import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { APP_ROUTE_PATHS } from './app-route-paths';

@Injectable({ providedIn: 'root' })
export class AppRoutingService {
  private readonly router = inject(Router);

  navigateToLogin(): void {
    void this.router.navigate([APP_ROUTE_PATHS.login]);
  }

  navigateToDashboard(): void {
    void this.router.navigate([APP_ROUTE_PATHS.dashboard]);
  }
}
