export type BankPublic = {
  id: string;
  name: string;
  bank_address: string;
  account_name: string;
  iban: string;
  sepa: string;
  swift: string;
  company_address: string;
  transfer_title: string;
  bank_description: string | null;
  bank_logo: string;
  created_at: string | null;
};

export type BanksPublic = {
  data: BankPublic[];
  count: number;
};
