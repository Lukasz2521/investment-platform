import { inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize, take, tap } from 'rxjs';

import { TransactionPublic } from '../../../core/transactions/models/transaction.model';
import { TransactionsService } from '../../../core/transactions/services/transactions.service';
import { UserPublic } from '../../../core/users/models/user.model';
import { UsersService } from '../../../core/users/services/users.service';

const DEFAULT_USER: UserPublic = {
  id: '',
  email: '',
  is_active: false,
  is_superuser: false,
  full_name: null,
  created_at: null,
  username: '',
  name: '',
  last_name: '',
  phone: '',
  country: '',
  city: '',
  address_line_one: '',
  address_line_two: '',
  timezone: '',
  account: null,
};

@Injectable()
export class UserDetailsService {
  readonly user = signal<UserPublic>(DEFAULT_USER);
  readonly userIsLoading = signal(false);

  readonly transactions = signal<TransactionPublic[]>([]);
  readonly transactionsIsLoading = signal(false);

  private readonly usersService = inject(UsersService);
  private readonly transactionsService = inject(TransactionsService);

  loadUserDetails(userId: string): void {
    this.userIsLoading.set(true);

    this.usersService
      .getById(userId)
      .pipe(
        take(1),
        tap((user) => this.user.set(user)),
        catchError(() => {
          this.user.set(DEFAULT_USER);
          return EMPTY;
        }),
        finalize(() => this.userIsLoading.set(false)),
      )
      .subscribe();
  }

  loadUserTransactions(userId: string): void {
    this.transactionsIsLoading.set(true);

    this.transactionsService
      .getByUserId(userId)
      .pipe(
        take(1),
        tap(({ data }) => this.transactions.set(data)),
        catchError(() => {
          this.transactions.set([]);
          return EMPTY;
        }),
        finalize(() => this.transactionsIsLoading.set(false)),
      )
      .subscribe();
  }
}
