export type DashboardTileId =
  | 'availableBalance'
  | 'assetsInCirculation'
  | 'currentProfit'
  | 'totalDeposits'
  | 'withdrawals'
  | 'returnsConversion';

export type DashboardTile = {
  id: DashboardTileId;
  titleKey: string;
};

export const DASHBOARD_TILES: DashboardTile[] = [
  {
    id: 'availableBalance',
    titleKey: 'app.dashboard.tiles.availableBalance.title',
  },
  {
    id: 'assetsInCirculation',
    titleKey: 'app.dashboard.tiles.assetsInCirculation.title',
  },
  {
    id: 'currentProfit',
    titleKey: 'app.dashboard.tiles.currentProfit.title',
  },
  {
    id: 'totalDeposits',
    titleKey: 'app.dashboard.tiles.totalDeposits.title',
  },
  {
    id: 'withdrawals',
    titleKey: 'app.dashboard.tiles.withdrawals.title',
  },
  {
    id: 'returnsConversion',
    titleKey: 'app.dashboard.tiles.returnsConversion.title',
  },
];
