import { UserPublic } from '../../users/models/user.model';
import { TransactionPublic } from '../models/transaction.model';

export type TransactionTableRow = TransactionPublic & {
  user_email: string;
};

export function mapTransactionsWithUserEmail(
  transactions: TransactionPublic[],
  users: UserPublic[],
): TransactionTableRow[] {
  const emailById = Object.fromEntries(users.map((user) => [user.id, user.email]));

  return transactions.map((transaction) => ({
    ...transaction,
    user_email: emailById[transaction.user_id] ?? '-',
  }));
}
