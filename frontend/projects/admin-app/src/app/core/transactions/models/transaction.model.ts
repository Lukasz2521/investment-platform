export enum TransactionType {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Refund = 'refund',
  CampaignDeposit = 'campaign_deposit',
  CampaignWithdraw = 'campaign_withdraw',
}

export enum TransactionStatus {
  Pending = 'pending',
  Done = 'done',
  Failed = 'failed',
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.Deposit]: 'Deposit',
  [TransactionType.Withdraw]: 'Withdraw',
  [TransactionType.Refund]: 'Refund',
  [TransactionType.CampaignDeposit]: 'Campaign Deposit',
  [TransactionType.CampaignWithdraw]: 'Campaign Withdraw',
};

const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  [TransactionStatus.Pending]: 'Pending',
  [TransactionStatus.Done]: 'Done',
  [TransactionStatus.Failed]: 'Failed',
};

export const TRANSACTION_TYPE_OPTIONS = (Object.values(TransactionType) as TransactionType[]).map(
  (value) => ({
    label: TRANSACTION_TYPE_LABELS[value],
    value,
  }),
);

export const CREATE_TRANSACTION_TYPE_OPTIONS = [
  TransactionType.Deposit,
  TransactionType.Withdraw,
  TransactionType.Refund,
].map((value) => ({
  label: TRANSACTION_TYPE_LABELS[value],
  value,
}));

export const TRANSACTION_STATUS_OPTIONS = (
  Object.values(TransactionStatus) as TransactionStatus[]
).map((value) => ({
  label: TRANSACTION_STATUS_LABELS[value],
  value,
}));

export const TRANSACTION_CURRENCY_OPTIONS = [{ label: '€', value: 'EUR' }];

export type TransactionPublic = {
  id: string;
  user_id: string;
  amount: string;
  transaction_type: string;
  description: string | null;
  status: string;
  created_at: string | null;
};

export type TransactionsPublic = {
  data: TransactionPublic[];
  count: number;
};

export type CreateTransaction = {
  amount: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  user_id: string;
  description: string | null;
};

export type UpdateTransaction = {
  status: TransactionStatus;
  description: string | null;
};

export function toTransactionStatus(status: string): TransactionStatus {
  const values = Object.values(TransactionStatus) as TransactionStatus[];
  return values.find((value) => value === status) ?? TransactionStatus.Pending;
}
