import { AccountType } from './account-type.model';

export type AccountPublicForUser = {
  account_type: AccountType;
  participation: number;
  balance: string;
  available_balance: string;
  total_deposit: string;
  total_withdraw: string;
  custom_campaigns: boolean;
  card_payments: boolean;
  created_at: string | null;
};

export type UserPublic = {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name: string | null;
  created_at: string | null;
  username: string;
  name: string;
  last_name: string;
  phone: string;
  country: string;
  city: string;
  address_line_one: string;
  address_line_two: string;
  timezone: string;
  account: AccountPublicForUser | null;
};

export type UsersPublic = {
  data: UserPublic[];
  count: number;
};
