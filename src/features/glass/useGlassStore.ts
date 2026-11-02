import { create } from 'zustand';
import {
  type GlassSettings,
  type GlassPreset,
  DEFAULT_GLASS_SETTINGS,
  applyGlassTokensToDocument,
} from './glassTokens';

const GLASS_STORAGE_KEY = 'scribblenote_glass_settings';

interface GlassStoreState {
  settings: GlassSettings;
  isLowEndDevice: boolean;
  isBackdropSupported: boolean;

  // Actions
  setPreset: (preset: GlassPreset) => void;
  setIntensity: (intensity: number) => void;
  setReduceTransparency: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setAccentColor: (color: string) => void;
  resetToDefaults: () => void;
  initialize: () => void;
}

const detectHardwareCapabilities = () => {
  if (typeof window === 'undefined') {
    return { isLowEnd: false, isBackdropSupported: true };
  }

  // Check CSS backdrop-filter support
  const isBackdropSupported =
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    (CSS.supports('backdrop-filter', 'blur(10px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(10px)'));

  // Low-end device heuristic (RAM < 4GB or <= 4 CPU threads)
  const nav = navigator as any;
  const memory = nav.deviceMemory || 8;
  const threads = nav.hardwareConcurrency || 8;
  const isLowEnd = memory < 4 || threads <= 2;

  // Check Android OS / accessibility preferences
  const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const prefersReducedMotion = hasMatchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const prefersReducedTransparency = hasMatchMedia
    ? window.matchMedia('(prefers-reduced-transparency: reduce)').matches
    : false;

  return {
    isLowEnd,
    isBackdropSupported,
    prefersReducedMotion,
    prefersReducedTransparency,
  };
};

const getInitialSettings = (): GlassSettings => {
  if (typeof window === 'undefined') return DEFAULT_GLASS_SETTINGS;

  const caps = detectHardwareCapabilities();

  try {
    const saved = localStorage.getItem(GLASS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_GLASS_SETTINGS,
        ...parsed,
        reduceMotion: parsed.reduceMotion ?? caps.prefersReducedMotion,
        reduceTransparency: parsed.reduceTransparency ?? caps.prefersReducedTransparency ?? caps.isLowEnd,
      };
    }
  } catch {
    // fallback
  }

  return {
    ...DEFAULT_GLASS_SETTINGS,
    reduceMotion: caps.prefersReducedMotion ?? false,
    reduceTransparency: (caps.prefersReducedTransparency || caps.isLowEnd) ?? false,
    intensity: caps.isLowEnd ? 40 : DEFAULT_GLASS_SETTINGS.intensity,
  };
};

export const useGlassStore = create<GlassStoreState>((set, get) => {
  const caps = detectHardwareCapabilities();
  const initialSettings = getInitialSettings();

  const persistAndApply = (newSettings: GlassSettings) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GLASS_STORAGE_KEY, JSON.stringify(newSettings));
      } catch {
        // ignore
      }
      const isDark = document.documentElement.classList.contains('dark');
      applyGlassTokensToDocument(newSettings, isDark);
    }
  };

  return {
    settings: initialSettings,
    isLowEndDevice: caps.isLowEnd,
    isBackdropSupported: caps.isBackdropSupported,

    setPreset: (preset: GlassPreset) => {
      const current = get().settings;
      let newIntensity = current.intensity;
      if (preset === 'clear') newIntensity = 85;
      else if (preset === 'tinted') newIntensity = 60;
      else newIntensity = 75;

      const updated: GlassSettings = { ...current, preset, intensity: newIntensity };
      set({ settings: updated });
      persistAndApply(updated);
    },

    setIntensity: (intensity: number) => {
      const current = get().settings;
      const updated: GlassSettings = { ...current, intensity };
      set({ settings: updated });
      persistAndApply(updated);
    },

    setReduceTransparency: (reduceTransparency: boolean) => {
      const current = get().settings;
      const updated: GlassSettings = { ...current, reduceTransparency };
      set({ settings: updated });
      persistAndApply(updated);
    },

    setReduceMotion: (reduceMotion: boolean) => {
      const current = get().settings;
      const updated: GlassSettings = { ...current, reduceMotion };
      set({ settings: updated });
      persistAndApply(updated);
    },

    setAccentColor: (accentColor: string) => {
      const current = get().settings;
      const updated: GlassSettings = { ...current, accentColor };
      set({ settings: updated });
      persistAndApply(updated);
    },

    resetToDefaults: () => {
      set({ settings: DEFAULT_GLASS_SETTINGS });
      persistAndApply(DEFAULT_GLASS_SETTINGS);
    },

    initialize: () => {
      if (typeof window === 'undefined') return;
      const settings = get().settings;
      const isDark = document.documentElement.classList.contains('dark');
      applyGlassTokensToDocument(settings, isDark);

      // Listen for dark mode attribute changes on documentElement
      const observer = new MutationObserver(() => {
        const dark = document.documentElement.classList.contains('dark');
        applyGlassTokensToDocument(get().settings, dark);
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

      // Listen for system reduced motion / transparency changes
      if (typeof window.matchMedia === 'function') {
        window.matchMedia('(prefers-reduced-motion: reduce)')?.addEventListener?.('change', (e) => {
          get().setReduceMotion(e.matches);
        });
        window.matchMedia('(prefers-reduced-transparency: reduce)')?.addEventListener?.('change', (e) => {
          get().setReduceTransparency(e.matches);
        });
      }
    },
  };
});
