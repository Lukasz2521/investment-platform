export const CONTACT_HEAR_ABOUT_OPTIONS = [
  'searchEngine',
  'socialMedia',
  'referral',
  'event',
  'press',
  'other',
] as const;

export type ContactHearAboutOption = (typeof CONTACT_HEAR_ABOUT_OPTIONS)[number];

export interface ContactForm {
  firstName: string;
  lastName: string;
  workEmail: string;
  companyWebsite: string;
  hearAboutUs: string;
  message: string;
}

export const EMPTY_CONTACT_FORM: ContactForm = {
  firstName: '',
  lastName: '',
  workEmail: '',
  companyWebsite: '',
  hearAboutUs: '',
  message: '',
};
