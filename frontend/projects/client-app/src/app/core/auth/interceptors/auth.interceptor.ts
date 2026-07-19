import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

function isAuthFailure(error: HttpErrorResponse): boolean {
  if (error.status === 401) {
    return true;
  }

  const detail = error.error?.detail;
  return error.status === 403 && detail === 'Could not validate credentials';
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  if (authService.isTokenExpired(token)) {
    authService.forceLogout();
    return throwError(() => new Error('Session expired'));
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isAuthFailure(error)) {
        authService.forceLogout();
      }

      return throwError(() => error);
    }),
  );
};
