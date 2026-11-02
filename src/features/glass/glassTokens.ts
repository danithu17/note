/**
 * ScribbleNote iOS 27 Liquid Glass Design Tokens & Recipe
 *
 * Liquid Glass Specification:
 * - Floating Control Layer: Translucent fill + backdrop-filter blur(24-40px) + saturate(170%)
 * - Highlight & Specular: 1px inner specular highlight border (25% light / 12% dark)
 * - Shadows: Soft multi-tier ambient shadow
 * - Content Layer: Solid and crisp surfaces for reading, cards, and canvas
 * - Adaptive Fallbacks: Automatically converts to solid surfaces on low-end hardware
 *   or when "Reduce Transparency" is requested by user / OS.
 */

export type GlassPreset = 'clear' | 'default' | 'tinted';

export interface GlassSettings {
  preset: GlassPreset;
  intensity: number; // 0 (Solid / Opaque) to 100 (Ultra Clear)
  reduceTransparency: boolean;
  reduceMotion: boolean;
  accentColor: string;
}

export interface CourseColorToken {
  name: string;
  hex: string;
  darkHex: string;
  rgb: string;
  badgeBg: string;
  badgeText: string;
}

export const COURSE_PALETTE: Record<string, CourseColorToken> = {
  blue: {
    name: 'Academic Blue',
    hex: '#007AFF',
    darkHex: '#0A84FF',
    rgb: '0, 122, 255',
    badgeBg: 'bg-blue-500/15 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    name: 'Scholar Violet',
    hex: '#AF52DE',
    darkHex: '#BF5AF2',
    rgb: '175, 82, 222',
    badgeBg: 'bg-purple-500/15 dark:bg-purple-500/20',
    badgeText: 'text-purple-600 dark:text-purple-400',
  },
  emerald: {
    name: 'Campus Emerald',
    hex: '#34C759',
    darkHex: '#30D158',
    rgb: '52, 199, 89',
    badgeBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
  },
  coral: {
    name: 'Sunset Coral',
    hex: '#FF6B6B',
    darkHex: '#FF7D7D',
    rgb: '255, 107, 107',
    badgeBg: 'bg-rose-500/15 dark:bg-rose-500/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    name: 'Lecture Amber',
    hex: '#FF9500',
    darkHex: '#FF9F0A',
    rgb: '255, 149, 0',
    badgeBg: 'bg-amber-500/15 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-400',
  },
  teal: {
    name: 'Research Teal',
    hex: '#30B0C7',
    darkHex: '#40C8E0',
    rgb: '48, 176, 199',
    badgeBg: 'bg-cyan-500/15 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-600 dark:text-cyan-400',
  },
  indigo: {
    name: 'Deep Indigo',
    hex: '#5856D6',
    darkHex: '#5E5CE6',
    rgb: '88, 86, 214',
    badgeBg: 'bg-indigo-500/15 dark:bg-indigo-500/20',
    badgeText: 'text-indigo-600 dark:text-indigo-400',
  },
  rose: {
    name: 'Seminar Rose',
    hex: '#FF2D55',
    darkHex: '#FF375F',
    rgb: '255, 45, 85',
    badgeBg: 'bg-pink-500/15 dark:bg-pink-500/20',
    badgeText: 'text-pink-600 dark:text-pink-400',
  },
};

export const DEFAULT_GLASS_SETTINGS: GlassSettings = {
  preset: 'default',
  intensity: 75,
  reduceTransparency: false,
  reduceMotion: false,
  accentColor: '#007AFF',
};

/**
 * Calculates CSS variables based on slider intensity (0-100) and preset
 */
export function calculateGlassValues(settings: GlassSettings, isDark: boolean) {
  const { intensity, reduceTransparency, preset } = settings;

  // Solid fallback condition
  if (reduceTransparency || intensity <= 5) {
    return {
      blur: '0px',
      saturate: '100%',
      fill: isDark ? 'rgba(28, 28, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
      border: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(60, 60, 67, 0.15)',
      innerHighlight: 'none',
      specularOpacity: 0,
      shadow: isDark
        ? '0 8px 24px rgba(0, 0, 0, 0.5)'
        : '0 8px 24px rgba(0, 0, 0, 0.06)',
      lensBg: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 122, 255, 0.12)',
    };
  }

  // Preset modifiers
  let blurPx = 30;
  let alpha = 0.75;
  let saturatePercent = 175;

  if (preset === 'clear') {
    // Ultra crystalline glass: high blur, lower opacity, specular reflection
    blurPx = 36 + Math.round((intensity / 100) * 12);
    alpha = Math.max(0.42, 0.7 - (intensity / 100) * 0.25);
    saturatePercent = 185;
  } else if (preset === 'tinted') {
    // Soft tinted milky glass: denser fill, warm diffusion
    blurPx = 24 + Math.round((intensity / 100) * 8);
    alpha = Math.min(0.92, 0.75 + (intensity / 100) * 0.18);
    saturatePercent = 160;
  } else {
    // Default balanced Liquid Glass
    blurPx = 28 + Math.round((intensity / 100) * 10);
    // Continuous map from intensity: 0 -> 0.95 opacity, 100 -> 0.52 opacity
    alpha = 0.95 - (intensity / 100) * 0.42;
    saturatePercent = 175;
  }

  const fill = isDark
    ? `rgba(28, 28, 30, ${alpha.toFixed(2)})`
    : `rgba(255, 255, 255, ${alpha.toFixed(2)})`;

  const borderAlpha = isDark ? 0.14 : 0.28;
  const border = isDark
    ? `rgba(255, 255, 255, ${borderAlpha})`
    : `rgba(255, 255, 255, ${borderAlpha})`;

  const innerHighlight = isDark
    ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)'
    : 'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.65)';

  const shadow = isDark
    ? '0 16px 40px -8px rgba(0, 0, 0, 0.65), 0 4px 12px -2px rgba(0, 0, 0, 0.45)'
    : '0 14px 34px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)';

  const lensBg = isDark
    ? 'rgba(255, 255, 255, 0.16)'
    : 'rgba(0, 122, 255, 0.14)';

  return {
    blur: `${blurPx}px`,
    saturate: `${saturatePercent}%`,
    fill,
    border,
    innerHighlight,
    specularOpacity: isDark ? 0.2 : 0.4,
    shadow,
    lensBg,
  };
}

/**
 * Apply computed glass design tokens directly to HTML root
 */
export function applyGlassTokensToDocument(settings: GlassSettings, isDark: boolean) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const values = calculateGlassValues(settings, isDark);

  root.style.setProperty('--liquid-glass-blur', values.blur);
  root.style.setProperty('--liquid-glass-saturate', values.saturate);
  root.style.setProperty('--liquid-glass-bg', values.fill);
  root.style.setProperty('--liquid-glass-border', values.border);
  root.style.setProperty('--liquid-glass-inner-highlight', values.innerHighlight);
  root.style.setProperty('--liquid-glass-shadow', values.shadow);
  root.style.setProperty('--liquid-glass-lens-bg', values.lensBg);
}
