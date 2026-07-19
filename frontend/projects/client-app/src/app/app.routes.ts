import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { APP_ROUTE_PATHS } from './core/routing/app-route-paths';

export const routes: Routes = [
  {
    path: APP_ROUTE_PATHS.login,
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: APP_ROUTE_PATHS.register,
    loadComponent: () => import('./features/register/register').then((m) => m.Register),
  },
  {
    path: APP_ROUTE_PATHS.dashboard,
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },
  {
    path: APP_ROUTE_PATHS.home,
    loadComponent: () =>
      import('./layout/marketing-shell/marketing-shell').then((m) => m.MarketingShell),
    children: [
      {
        path: APP_ROUTE_PATHS.home,
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: APP_ROUTE_PATHS.company,
        loadComponent: () => import('./features/company/company').then((m) => m.Company),
      },
      {
        path: APP_ROUTE_PATHS.contact,
        loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
      },
      {
        path: APP_ROUTE_PATHS.partnerships,
        loadComponent: () =>
          import('./features/partnerships/partnerships').then((m) => m.Partnerships),
      },
      {
        path: `${APP_ROUTE_PATHS.partnerships}/:id`,
        loadComponent: () =>
          import('./features/partnerships/partnership-detail/partnership-detail').then(
            (m) => m.PartnershipDetail,
          ),
      },
    ],
  },
];
