import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AppRoutingService } from '../../routing/app-routing.service';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  inject(AppRoutingService).navigateToLogin();

  return false;
};
