import { Routes } from '@angular/router';

import { APP_ROUTE_PATHS } from './core/routing/app-route-paths';

export const routes: Routes = [
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
