import { APP_ROUTE_PATHS } from './app-route-paths';

export type AppNavItem = {
  label: string;
  icon: string;
  route?: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-th-large',
    route: APP_ROUTE_PATHS.dashboard,
  },
  {
    label: 'Store',
    icon: 'pi pi-shop',
  },
  {
    label: 'Transactions',
    icon: 'pi pi-sync',
    route: APP_ROUTE_PATHS.transactions,
  },
  {
    label: 'Users',
    icon: 'pi pi-users',
    route: APP_ROUTE_PATHS.users,
  },
  {
    label: 'Banks',
    icon: 'pi pi-building',
    route: APP_ROUTE_PATHS.banks,
  },
  {
    label: 'Security',
    icon: 'pi pi-shield',
  },
  {
    label: 'Signals',
    icon: 'pi pi-bolt',
  },
];
