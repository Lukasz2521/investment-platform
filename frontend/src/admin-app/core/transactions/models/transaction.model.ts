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
