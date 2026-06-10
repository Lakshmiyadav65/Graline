export const LANGUAGE_TO_LOCALE = {
  English: 'en',
  Telugu: 'te',
  Hindi: 'hi',
  Tamil: 'ta',
  Kannada: 'kn'
} as const;

export const LOCALE_TO_LANGUAGE = {
  en: 'English',
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  kn: 'Kannada'
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_TO_LOCALE;
export type SupportedLocale = keyof typeof LOCALE_TO_LANGUAGE;

export function getLocaleFromLanguage(lang: string | null | undefined): SupportedLocale {
  if (lang && lang in LANGUAGE_TO_LOCALE) {
    return LANGUAGE_TO_LOCALE[lang as SupportedLanguage];
  }
  return 'en';
}

export function getLanguageFromLocale(locale: string | null | undefined): SupportedLanguage {
  if (locale && locale in LOCALE_TO_LANGUAGE) {
    return LOCALE_TO_LANGUAGE[locale as SupportedLocale];
  }
  return 'English';
}
