import { BankPublic } from '../../banks/models/bank.model';

export type AccountBankPublic = {
  id: string;
  is_enabled: boolean;
  bank: BankPublic;
};

export type AccountPublicForUser = {
  created_at: string | null;
  banks: AccountBankPublic[];
};

export type UserPublicWithAccount = {
  id: string;
  email: string;
  is_active: boolean;
  username: string;
  name: string;
  last_name: string;
  phone?: string;
  country?: string;
  city?: string;
  address_line_one?: string;
  address_line_two?: string;
  timezone?: string;
  created_at?: string | null;
  account: AccountPublicForUser | null;
};
