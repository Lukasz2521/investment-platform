export type UserPublic = {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  full_name?: string | null;
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
};
