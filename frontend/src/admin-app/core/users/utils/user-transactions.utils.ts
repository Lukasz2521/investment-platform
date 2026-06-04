import { TransactionPublic } from '../../transactions/models/transaction.model';

const DEPOSIT_TYPES = new Set(['deposit', 'campaign_deposit', 'refund']);
const WITHDRAW_TYPES = new Set(['withdraw', 'campaign_withdraw']);

export type UserFinancialSummary = {
  availableBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
};

function sumAmounts(transactions: TransactionPublic[], types: Set<string>): number {
  return transactions
    .filter((tx) => tx.status === 'done' && types.has(tx.transaction_type))
    .reduce((total, tx) => total + Number(tx.amount), 0);
}

export function calculateUserFinancialSummary(
  transactions: TransactionPublic[],
): UserFinancialSummary {
  const totalDeposit = sumAmounts(transactions, DEPOSIT_TYPES);
  const totalWithdraw = sumAmounts(transactions, WITHDRAW_TYPES);

  return {
    availableBalance: totalDeposit - totalWithdraw,
    totalDeposit,
    totalWithdraw,
  };
}
