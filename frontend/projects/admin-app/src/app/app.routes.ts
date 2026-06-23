import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { APP_ROUTE_PATHS } from './core/routing/app-route-paths';

export const routes: Routes = [
  {
    path: APP_ROUTE_PATHS.login,
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: APP_ROUTE_PATHS.root,
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard],
    children: [
      {
        path: APP_ROUTE_PATHS.root,
        redirectTo: APP_ROUTE_PATHS.dashboard,
        pathMatch: 'full',
      },
      {
        path: APP_ROUTE_PATHS.dashboard,
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: APP_ROUTE_PATHS.banks,
        loadComponent: () => import('./features/banks/banks').then((m) => m.Banks),
      },
      {
        path: APP_ROUTE_PATHS.campaigns,
        loadComponent: () =>
          import('./features/campaigns/campaigns-list').then((m) => m.CampaignsList),
      },
      {
        path: APP_ROUTE_PATHS.transactions,
        loadComponent: () =>
          import('./features/transactions/transactions-list').then((m) => m.TransactionsList),
      },
      {
        path: APP_ROUTE_PATHS.users,
        loadComponent: () =>
          import('./features/users/users-list').then((m) => m.UsersList),
      },
      {
        path: `${APP_ROUTE_PATHS.users}/:userId`,
        loadComponent: () =>
          import('./features/users/user-detail').then((m) => m.UserDetail),
      },
    ],
  },
];
