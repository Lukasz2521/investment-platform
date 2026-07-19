import { UserPublic } from './user-public.model';

export type UserRegisterPayload = {
  username: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address_line_one: string;
  address_line_two: string;
  timezone: string;
  password: string;
};

export type { UserPublic };
