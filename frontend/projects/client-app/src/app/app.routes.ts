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
        loadComponent: () => import('./features/marketing/home/home').then((m) => m.Home),
      },
    ],
  },
];
