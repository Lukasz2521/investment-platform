import { Component } from '@angular/core';

import { TranslatePipe } from '../../core/i18n/pipes/translate.pipe';
import { DEPOSIT_PAYMENT_METHODS } from './deposit-payment-methods';

@Component({
  selector: 'app-deposit',
  imports: [TranslatePipe],
  templateUrl: './deposit.html',
  styleUrl: './deposit.scss',
})
export class Deposit {
  protected readonly paymentMethods = DEPOSIT_PAYMENT_METHODS;
}
