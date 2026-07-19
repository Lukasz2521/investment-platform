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
