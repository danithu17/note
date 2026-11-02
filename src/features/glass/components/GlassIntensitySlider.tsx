import React from 'react';
import { Sparkles, Sliders, EyeOff, Cpu, RefreshCw } from 'lucide-react';
import { useGlassStore } from '../useGlassStore';
import { type GlassPreset } from '../glassTokens';
import { sound } from '@/utils/sound';
import { hapticsPlatform } from '@/platform';

export const GlassIntensitySlider: React.FC<{ className?: string }> = ({ className = '' }) => {
  const {
    settings,
    isLowEndDevice,
    isBackdropSupported,
    setPreset,
    setIntensity,
    setReduceTransparency,
    setReduceMotion,
    resetToDefaults,
  } = useGlassStore();

  const presets: Array<{ id: GlassPreset; title: string; desc: string }> = [
    { id: 'clear', title: 'Clear', desc: 'High blur, crystalline reflection' },
    { id: 'default', title: 'Default', desc: 'Balanced 30px Liquid Glass' },
    { id: 'tinted', title: 'Tinted', desc: 'Subtle milky tint, soft diffusion' },
  ];

  const handlePresetClick = (p: GlassPreset) => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    setPreset(p);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setIntensity(val);
  };

  return (
    <div className={`space-y-6 select-none ${className}`}>
      {/* 1. Presets Header (Clear / Default / Tinted) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[14px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#007aff]" />
            Liquid Glass Preset
          </label>
          <button
            onClick={() => {
              sound.click();
              resetToDefaults();
            }}
            title="Reset to iOS 27 Defaults"
            className="text-[12px] text-[#007aff] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => {
            const isSelected = settings.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetClick(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all spring-interactive cursor-pointer ${
                  isSelected
                    ? 'liquid-glass-control border-[#007aff] dark:border-[#0a84ff] shadow-md ring-2 ring-[#007aff]/20'
                    : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 hover:bg-slate-200/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div
                  className={`text-[13px] font-semibold ${
                    isSelected ? 'text-[#007aff] dark:text-[#0a84ff]' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {p.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight line-clamp-2">
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Continuous Glass Intensity Slider (Opaque to Clear) */}
      <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-slate-500" />
            Glass Intensity: <span className="font-bold text-slate-900 dark:text-white">{settings.intensity}%</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            {settings.intensity <= 15 ? 'Solid Opaque' : settings.intensity >= 85 ? 'Ultra Clear' : 'Liquid'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          disabled={settings.reduceTransparency}
          value={settings.intensity}
          onChange={handleSliderChange}
          className="w-full accent-[#007aff] dark:accent-[#0a84ff] cursor-pointer disabled:opacity-40"
        />

        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
          <span>Opaque (Solid)</span>
          <span>Balanced</span>
          <span>Clear (Vibrant)</span>
        </div>
      </div>

      {/* 3. System & Accessibility Toggles */}
      <div className="space-y-3">
        {/* Reduce Transparency Toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-slate-900 dark:text-white">
                Reduce Transparency
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Disables backdrop blur and uses high-contrast solid backgrounds
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reduceTransparency}
            onChange={(e) => {
              sound.click();
              setReduceTransparency(e.target.checked);
            }}
            className="w-5 h-5 rounded-md accent-[#007aff] cursor-pointer"
          />
        </label>

        {/* Remove Animations / Reduce Motion */}
        <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-slate-900 dark:text-white">
                Reduce Animations
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Respects Android "Remove animations" and disables spring physics
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(e) => {
              sound.click();
              setReduceMotion(e.target.checked);
            }}
            className="w-5 h-5 rounded-md accent-[#007aff] cursor-pointer"
          />
        </label>
      </div>

      {/* 4. Hardware Diagnostic Status Badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-200/50 dark:bg-slate-800/30 text-[11px] text-slate-600 dark:text-slate-400">
        <Cpu className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          <strong>Hardware Status:</strong>{' '}
          {isBackdropSupported ? 'Full GPU backdrop blur supported' : 'Software fallback active'}{' '}
          • {isLowEndDevice ? '⚡ Power Saving (Reduced blur)' : '🚀 High Performance Mode'}
        </span>
      </div>
    </div>
  );
};
