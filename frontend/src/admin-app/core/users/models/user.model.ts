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
};

export type UsersPublic = {
  data: UserPublic[];
  count: number;
};
