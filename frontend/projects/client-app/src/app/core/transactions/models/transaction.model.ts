export type TransactionType =
  | 'deposit'
  | 'withdraw'
  | 'refund'
  | 'campaign_deposit'
  | 'campaign_withdraw';

export type TransactionStatus = 'pending' | 'done' | 'failed';

export type TransactionPublic = {
  id: string;
  user_id: string;
  amount: string;
  transaction_type: TransactionType | string;
  description: string | null;
  status: TransactionStatus | string;
  created_at: string | null;
};

export type TransactionsPublic = {
  data: TransactionPublic[];
  count: number;
};

export type WithdrawTransferType = 'sepa' | 'swift';

export type CreateWithdrawRequest = {
  amount: string;
  account_holder_name: string;
  payment_purpose: string;
  transfer_type: WithdrawTransferType;
  sepa_address: string;
  bank_address: string;
};
