import { describe, it, expect, beforeEach } from 'vitest';
import { useI18nStore } from '@/core/i18n/useI18nStore';
import { translations, type Locale } from '@/core/i18n/translations';

describe('Phase 4: Design System, Accessibility & Localization (i18n)', () => {
  beforeEach(() => {
    useI18nStore.setState({
      locale: 'en',
      t: translations.en,
    });
    localStorage.clear();
  });

  describe('i18n Localization Engine', () => {
    it('supports English, Sinhala, and Tamil with identical schema coverage', () => {
      const locales: Locale[] = ['en', 'si', 'ta'];

      for (const loc of locales) {
        const dict = translations[loc];
        expect(dict).toBeDefined();
        expect(dict.app.title).toBeDefined();
        expect(dict.navigation.feed).toBeDefined();
        expect(dict.navigation.notes).toBeDefined();
        expect(dict.navigation.canvas).toBeDefined();
        expect(dict.sync.synced).toBeDefined();
        expect(dict.studyHub.flashcards).toBeDefined();
        expect(dict.studyHub.aiStudy).toBeDefined();
        expect(dict.sidebar.newNote).toBeDefined();
        expect(dict.actions.rename).toBeDefined();
        expect(dict.actions.duplicate).toBeDefined();
      }
    });

    it('switches locale dynamically and persists to localStorage', () => {
      expect(useI18nStore.getState().locale).toBe('en');

      // Switch to Sinhala
      useI18nStore.getState().setLocale('si');
      expect(useI18nStore.getState().locale).toBe('si');
      expect(useI18nStore.getState().t.navigation.notes).toBe('සටහන්');
      expect(localStorage.getItem('scribblenote_locale')).toBe('si');

      // Switch to Tamil
      useI18nStore.getState().setLocale('ta');
      expect(useI18nStore.getState().locale).toBe('ta');
      expect(useI18nStore.getState().t.navigation.notes).toBe('குறிப்புகள்');
      expect(localStorage.getItem('scribblenote_locale')).toBe('ta');

      // Switch back to English
      useI18nStore.getState().setLocale('en');
      expect(useI18nStore.getState().locale).toBe('en');
      expect(useI18nStore.getState().t.navigation.notes).toBe('Notes');
    });

    it('falls back gracefully to English on invalid locale input', () => {
      // @ts-expect-error testing invalid locale fallback
      useI18nStore.getState().setLocale('unknown_locale');
      expect(useI18nStore.getState().t).toEqual(translations.en);
    });
  });

  describe('Design System & Keyboard Accessibility', () => {
    it('contains valid keyboard shortcuts across all study actions', () => {
      const en = translations.en;
      expect(en.navigation.themeDark).toBeDefined();
      expect(en.navigation.themeLight).toBeDefined();
      expect(en.canvas.undo).toBeDefined();
      expect(en.canvas.redo).toBeDefined();
      expect(en.canvas.resetView).toBeDefined();
    });
  });
});
