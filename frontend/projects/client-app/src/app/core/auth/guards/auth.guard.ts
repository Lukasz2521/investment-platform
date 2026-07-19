import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { APP_ROUTE_PATHS } from '../../routing/app-route-paths';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  void inject(Router).navigate(['/', APP_ROUTE_PATHS.login]);
  return false;
};
