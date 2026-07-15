export interface ContactForm {
  login: string;
  phoneNumber: string;
}

export const EMPTY_CONTACT_FORM: ContactForm = {
  login: '',
  phoneNumber: '',
};
