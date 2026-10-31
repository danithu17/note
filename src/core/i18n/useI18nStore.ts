import { create } from 'zustand';
import { translations, type Locale, type TranslationDictionary } from './translations';

interface I18nState {
  locale: Locale;
  t: TranslationDictionary;
  setLocale: (locale: Locale) => void;
}

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('scribblenote_locale') as Locale;
    if (saved && (saved === 'en' || saved === 'si' || saved === 'ta')) {
      return saved;
    }
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('si')) return 'si';
    if (navLang.startsWith('ta')) return 'ta';
  } catch {}
  return 'en';
};

const initialLocale = getInitialLocale();

export const useI18nStore = create<I18nState>((set) => ({
  locale: initialLocale,
  t: translations[initialLocale],
  setLocale: (locale: Locale) => {
    try {
      localStorage.setItem('scribblenote_locale', locale);
    } catch {}
    set({
      locale,
      t: translations[locale] || translations.en,
    });
  },
}));
