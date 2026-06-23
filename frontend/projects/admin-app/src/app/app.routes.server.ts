import { RenderMode, ServerRoute } from '@angular/ssr';

import { APP_ROUTE_PATHS } from './core/routing/app-route-paths';

export const serverRoutes: ServerRoute[] = [
  {
    path: `${APP_ROUTE_PATHS.users}/*`,
    renderMode: RenderMode.Client,
  },
  {
    path: APP_ROUTE_PATHS.dashboard,
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
