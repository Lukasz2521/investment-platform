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
  valueKey: string;
};

export const DASHBOARD_TILES: DashboardTile[] = [
  {
    id: 'availableBalance',
    titleKey: 'app.dashboard.tiles.availableBalance.title',
    valueKey: 'app.dashboard.tiles.availableBalance.value',
  },
  {
    id: 'assetsInCirculation',
    titleKey: 'app.dashboard.tiles.assetsInCirculation.title',
    valueKey: 'app.dashboard.tiles.assetsInCirculation.value',
  },
  {
    id: 'currentProfit',
    titleKey: 'app.dashboard.tiles.currentProfit.title',
    valueKey: 'app.dashboard.tiles.currentProfit.value',
  },
  {
    id: 'totalDeposits',
    titleKey: 'app.dashboard.tiles.totalDeposits.title',
    valueKey: 'app.dashboard.tiles.totalDeposits.value',
  },
  {
    id: 'withdrawals',
    titleKey: 'app.dashboard.tiles.withdrawals.title',
    valueKey: 'app.dashboard.tiles.withdrawals.value',
  },
  {
    id: 'returnsConversion',
    titleKey: 'app.dashboard.tiles.returnsConversion.title',
    valueKey: 'app.dashboard.tiles.returnsConversion.value',
  },
];
