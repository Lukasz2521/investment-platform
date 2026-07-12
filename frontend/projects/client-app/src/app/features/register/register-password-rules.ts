export interface PasswordRequirement {
  id: string;
  labelKey: string;
  met: boolean;
}

const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_DIGIT = /[0-9]/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;
const LATIN_ONLY = /^[\x20-\x7E]*$/;

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: 'length',
      labelKey: 'marketing.register.passwordReq.length',
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      labelKey: 'marketing.register.passwordReq.uppercase',
      met: HAS_UPPERCASE.test(password),
    },
    {
      id: 'lowercase',
      labelKey: 'marketing.register.passwordReq.lowercase',
      met: HAS_LOWERCASE.test(password),
    },
    {
      id: 'digit',
      labelKey: 'marketing.register.passwordReq.digit',
      met: HAS_DIGIT.test(password),
    },
    {
      id: 'special',
      labelKey: 'marketing.register.passwordReq.special',
      met: HAS_SPECIAL.test(password),
    },
    {
      id: 'latin',
      labelKey: 'marketing.register.passwordReq.latin',
      met: password.length === 0 || LATIN_ONLY.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRequirements(password).every((requirement) => requirement.met);
}
