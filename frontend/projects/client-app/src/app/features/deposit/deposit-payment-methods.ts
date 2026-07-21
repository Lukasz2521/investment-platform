export type PaymentMethodStatus = 'active' | 'inactive';

export type PaymentMethod = {
  id: 'bankTransfer' | 'card';
  icon: 'bank' | 'card';
  labelKey: string;
  status: PaymentMethodStatus;
  statusKey: string;
};

export const DEPOSIT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bankTransfer',
    icon: 'bank',
    labelKey: 'app.deposit.paymentMethods.bankTransfer',
    status: 'active',
    statusKey: 'app.deposit.paymentMethods.statusActive',
  },
  {
    id: 'card',
    icon: 'card',
    labelKey: 'app.deposit.paymentMethods.card',
    status: 'inactive',
    statusKey: 'app.deposit.paymentMethods.statusInactive',
  },
];
