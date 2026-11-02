import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  calculateGlassValues,
  COURSE_PALETTE,
  DEFAULT_GLASS_SETTINGS,
} from '@/features/glass/glassTokens';
import { useGlassStore } from '@/features/glass/useGlassStore';
import { FloatingGlassTabBar } from '@/features/glass/components/FloatingGlassTabBar';
import { GlassSearchPill } from '@/features/glass/components/GlassSearchPill';
import { GlassChip } from '@/features/glass/components/GlassChip';
import { ContentCard } from '@/features/glass/components/ContentCard';
import { GlassIntensitySlider } from '@/features/glass/components/GlassIntensitySlider';

describe('iOS 27 Liquid Glass Design Tokens & Engine', () => {
  beforeEach(() => {
    useGlassStore.getState().resetToDefaults();
  });

  it('calculates balanced Liquid Glass tokens for default preset', () => {
    const values = calculateGlassValues(DEFAULT_GLASS_SETTINGS, false);

    expect(values.blur).toBe('36px');
    expect(values.saturate).toBe('175%');
    expect(values.fill).toContain('rgba(255, 255, 255');
    expect(values.innerHighlight).toContain('inset 0 1px');
    expect(values.border).toBeDefined();
  });

  it('calculates ultra crystalline tokens for clear preset', () => {
    const clearSettings = { ...DEFAULT_GLASS_SETTINGS, preset: 'clear' as const, intensity: 85 };
    const values = calculateGlassValues(clearSettings, false);

    expect(parseInt(values.blur)).toBeGreaterThanOrEqual(40);
    expect(values.saturate).toBe('185%');
  });

  it('falls back to solid opaque surface when reduceTransparency is enabled', () => {
    const accessibleSettings = { ...DEFAULT_GLASS_SETTINGS, reduceTransparency: true };
    const values = calculateGlassValues(accessibleSettings, false);

    expect(values.blur).toBe('0px');
    expect(values.saturate).toBe('100%');
    expect(values.fill).toBe('rgba(255, 255, 255, 0.98)');
    expect(values.innerHighlight).toBe('none');
  });

  it('falls back to solid dark surface in dark mode when reduceTransparency is enabled', () => {
    const accessibleSettings = { ...DEFAULT_GLASS_SETTINGS, reduceTransparency: true };
    const values = calculateGlassValues(accessibleSettings, true);

    expect(values.blur).toBe('0px');
    expect(values.fill).toBe('rgba(28, 28, 30, 0.98)');
  });

  it('provides course color tokens for all key academic disciplines', () => {
    expect(COURSE_PALETTE.blue.hex).toBe('#007AFF');
    expect(COURSE_PALETTE.purple.hex).toBe('#AF52DE');
    expect(COURSE_PALETTE.emerald.hex).toBe('#34C759');
    expect(COURSE_PALETTE.coral.hex).toBe('#FF6B6B');
    expect(COURSE_PALETTE.amber.hex).toBe('#FF9500');
  });
});

describe('useGlassStore State Management', () => {
  beforeEach(() => {
    useGlassStore.getState().resetToDefaults();
  });

  it('updates preset and adjusts corresponding intensity', () => {
    const store = useGlassStore.getState();

    store.setPreset('clear');
    expect(useGlassStore.getState().settings.preset).toBe('clear');
    expect(useGlassStore.getState().settings.intensity).toBe(85);

    store.setPreset('tinted');
    expect(useGlassStore.getState().settings.preset).toBe('tinted');
    expect(useGlassStore.getState().settings.intensity).toBe(60);
  });

  it('adjusts continuous intensity slider from 0 to 100', () => {
    const store = useGlassStore.getState();

    store.setIntensity(42);
    expect(useGlassStore.getState().settings.intensity).toBe(42);

    store.setIntensity(100);
    expect(useGlassStore.getState().settings.intensity).toBe(100);
  });

  it('toggles reduceTransparency and reduceMotion', () => {
    const store = useGlassStore.getState();

    store.setReduceTransparency(true);
    expect(useGlassStore.getState().settings.reduceTransparency).toBe(true);

    store.setReduceMotion(true);
    expect(useGlassStore.getState().settings.reduceMotion).toBe(true);
  });
});

describe('Liquid Glass Component Library', () => {
  it('renders FloatingGlassTabBar with 5 navigation tabs and quick-create button', () => {
    let selected = 'home';
    let created = false;

    render(
      <FloatingGlassTabBar
        activeTab={selected as any}
        onSelectTab={(t) => {
          selected = t;
        }}
        onQuickCreate={() => {
          created = true;
        }}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Canvas')).toBeInTheDocument();
    expect(screen.getByText('Assistant')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();

    const notesBtn = screen.getByLabelText('Notes tab');
    fireEvent.click(notesBtn);
    expect(selected).toBe('notes');

    const quickCreateBtn = screen.getByLabelText('Quick create note or drawing');
    fireEvent.click(quickCreateBtn);
    expect(created).toBe(true);
  });

  it('renders GlassSearchPill and triggers search / voice actions', () => {
    let clicked = false;
    let voiceClicked = false;

    render(
      <GlassSearchPill
        placeholder="Search notes..."
        onClick={() => {
          clicked = true;
        }}
        onVoiceClick={() => {
          voiceClicked = true;
        }}
      />
    );

    const pill = screen.getByLabelText('Search notes');
    fireEvent.click(pill);
    expect(clicked).toBe(true);

    const micBtn = screen.getByLabelText('Voice search dictation');
    fireEvent.click(micBtn);
    expect(voiceClicked).toBe(true);
  });

  it('renders GlassChip with count badge and selection state', () => {
    let chipClicked = false;

    render(
      <GlassChip
        label="Chemistry"
        count={8}
        isSelected={true}
        onClick={() => {
          chipClicked = true;
        }}
      />
    );

    expect(screen.getByText('Chemistry')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    const btn = screen.getByRole('checkbox');
    expect(btn).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(btn);
    expect(chipClicked).toBe(true);
  });

  it('renders ContentCard in Hero mode for resuming last lecture', () => {
    let heroClicked = false;

    render(
      <ContentCard
        isHero={true}
        title="Machine Learning Foundations"
        subject="CS 101"
        updatedAtText="Edited 10m ago"
        pageCount={3}
        onClick={() => {
          heroClicked = true;
        }}
      />
    );

    expect(screen.getByText('Machine Learning Foundations')).toBeInTheDocument();
    expect(screen.getByText('CS 101')).toBeInTheDocument();
    expect(screen.getByText('Edited 10m ago')).toBeInTheDocument();
    expect(screen.getByText('3 Pages')).toBeInTheDocument();

    const card = screen.getByLabelText('Continue reading Machine Learning Foundations');
    fireEvent.click(card);
    expect(heroClicked).toBe(true);
  });

  it('renders GlassIntensitySlider with presets and continuous slider', () => {
    render(<GlassIntensitySlider />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Tinted')).toBeInTheDocument();
    expect(screen.getByText('Reduce Transparency')).toBeInTheDocument();
    expect(screen.getByText('Reduce Animations')).toBeInTheDocument();
  });
});
