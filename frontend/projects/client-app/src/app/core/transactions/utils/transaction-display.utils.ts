import { TransactionPublic } from '../models/transaction.model';

export function formatTransactionAmount(amount: string): string {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return amount;
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function transactionTypeLabelKey(type: string): string {
  switch (type) {
    case 'deposit':
      return 'app.dashboard.history.type.deposit';
    case 'withdraw':
      return 'app.dashboard.history.type.withdraw';
    case 'refund':
      return 'app.dashboard.history.type.refund';
    case 'campaign_deposit':
      return 'app.dashboard.history.type.campaignDeposit';
    case 'campaign_withdraw':
      return 'app.dashboard.history.type.campaignWithdraw';
    default:
      return 'app.dashboard.history.type.unknown';
  }
}

export function transactionStatusLabelKey(status: string): string {
  switch (status) {
    case 'pending':
      return 'app.dashboard.history.status.pending';
    case 'done':
      return 'app.dashboard.history.status.done';
    case 'failed':
      return 'app.dashboard.history.status.failed';
    default:
      return 'app.dashboard.history.status.unknown';
  }
}

export function isOutgoingTransaction(transaction: TransactionPublic): boolean {
  return (
    transaction.transaction_type === 'withdraw' ||
    transaction.transaction_type === 'campaign_withdraw'
  );
}
