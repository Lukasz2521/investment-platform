export enum AccountType {
  Fundamental = 'fundament',
  Accelerator = 'accelerator',
  Strategy = 'strategy',
  Alpha = 'alpha',
  Protector = 'protector',
  Dominion = 'dominion',
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.Fundamental]: 'Fundamental',
  [AccountType.Accelerator]: 'Accelerator',
  [AccountType.Strategy]: 'Strategy',
  [AccountType.Alpha]: 'Alpha',
  [AccountType.Protector]: 'Protector',
  [AccountType.Dominion]: 'Dominion',
};

export const ACCOUNT_TYPE_OPTIONS = (Object.values(AccountType) as AccountType[]).map((value) => ({
  label: ACCOUNT_TYPE_LABELS[value],
  value,
}));

export const ACCOUNT_TYPE_PARTICIPATION: Record<AccountType, number> = {
  [AccountType.Fundamental]: 18,
  [AccountType.Accelerator]: 23,
  [AccountType.Strategy]: 28,
  [AccountType.Alpha]: 33,
  [AccountType.Protector]: 40,
  [AccountType.Dominion]: 49,
};
