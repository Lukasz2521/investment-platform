export const REGISTER_COUNTRIES = [
  'Poland',
  'Germany',
  'France',
  'United Kingdom',
  'United States',
  'Canada',
  'Spain',
  'Italy',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Austria',
  'Czech Republic',
  'Slovakia',
  'Ukraine',
  'Portugal',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Ireland',
  'Australia',
  'Japan',
  'Brazil',
  'Mexico',
  'Other',
] as const;

export const REGISTER_TIME_ZONES = [
  'Europe/Warsaw',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Prague',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Kiev',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
] as const;

export interface RegisterForm {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  town: string;
  zipCode: string;
  addressLine1: string;
  addressLine2: string;
  timeZone: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  marketingConsent: boolean;
}

export const EMPTY_REGISTER_FORM: RegisterForm = {
  username: '',
  firstName: '',
  lastName: '',
  phone: '',
  country: '',
  town: '',
  zipCode: '',
  addressLine1: '',
  addressLine2: '',
  timeZone: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  marketingConsent: false,
};
