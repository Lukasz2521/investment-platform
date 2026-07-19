export type LanguageCode = 'en' | 'pl' | 'fr' | 'ru' | 'pt' | 'de';

export type Language = {
  code: LanguageCode;
  label: string;
  flag: string;
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGE_STORAGE_KEY = 'client-app-language';

export function isLanguageCode(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((language) => language.code === value);
}
