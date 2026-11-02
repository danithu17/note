import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Search,
  BookOpen,
  ArrowLeft,
  Sun,
  Moon,
  Plus,
  Palette,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { FloatingGlassTabBar, type GlassTabId } from './FloatingGlassTabBar';
import { GlassSearchPill } from './GlassSearchPill';
import { GlassSheet } from './GlassSheet';
import { ContentCard } from './ContentCard';
import { GlassChip } from './GlassChip';
import { GlassIntensitySlider } from './GlassIntensitySlider';
import { COURSE_PALETTE } from '../glassTokens';
import { useCanvasStore } from '@/store/useCanvasStore';
import { sound } from '@/utils/sound';

export const GlassShowcaseView: React.FC = () => {
  const { isDarkMode, toggleDarkMode, setViewMode } = useCanvasStore();

  const [activeTab, setActiveTab] = useState<GlassTabId>('home');
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>(['all', 'notes']);

  const toggleChip = (id: string) => {
    setSelectedChips((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f2f7] dark:bg-black text-slate-900 dark:text-slate-100 font-sans pb-36 select-none transition-colors">
      {/* Top Floating Glass Navigation Bar */}
      <header className="sticky top-0 z-30 liquid-glass-control border-t-0 border-x-0 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.click();
              setViewMode('app');
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-[14px] font-medium cursor-pointer"
            title="Return to Workspace"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Workspace</span>
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                iOS 27 Liquid Glass
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Design System & Component Showcase
              </p>
            </div>
          </div>
        </div>

        {/* Theme and Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.click();
              toggleDarkMode();
            }}
            aria-label="Toggle theme"
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.click();
              setSheetOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#007aff] dark:bg-[#0a84ff] text-white text-[13px] font-semibold shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all spring-interactive cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Open Sheet</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-10">
        {/* Section 0: Large Title Header Spec */}
        <section className="space-y-1">
          <span className="text-[13px] font-bold uppercase tracking-wider text-[#007aff] dark:text-[#0a84ff]">
            Typography & Inset Scale
          </span>
          <h2 className="text-[34px] leading-[41px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Good evening, Alex
          </h2>
          <p className="text-[17px] leading-[22px] text-slate-500 dark:text-slate-400">
            Monday, November 2 • 3 lectures scheduled today
          </p>
        </section>

        {/* Section 1: Glass Search Pill */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-[#007aff]" />
              Floating Glass Search Pill
            </h3>
            <span className="text-[12px] text-slate-400 font-mono">Component #1</span>
          </div>

          <GlassSearchPill
            placeholder="Search notes, handwriting, formulas, slides..."
            value={searchQuery}
            onChange={setSearchQuery}
            isReadOnly={false}
            onVoiceClick={() => alert('Dictation / Voice Search triggered with haptics')}
          />
        </section>

        {/* Section 2: Glass Filter Chips */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#007aff]" />
              Glass Filter & Course Chips
            </h3>
            <span className="text-[12px] text-slate-400 font-mono">Component #2</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <GlassChip
              label="All Notes"
              count={24}
              isSelected={selectedChips.includes('all')}
              onClick={() => toggleChip('all')}
            />
            <GlassChip
              label="Handwritten Notes"
              count={12}
              isSelected={selectedChips.includes('notes')}
              onClick={() => toggleChip('notes')}
            />
            <GlassChip
              label="PDF Annotations"
              count={5}
              isSelected={selectedChips.includes('pdf')}
              onClick={() => toggleChip('pdf')}
            />
            <GlassChip
              label="Voice Memos"
              count={7}
              isSelected={selectedChips.includes('audio')}
              onClick={() => toggleChip('audio')}
            />
            <GlassChip
              label="Pinned Only"
              isSelected={selectedChips.includes('pinned')}
              onClick={() => toggleChip('pinned')}
            />
          </div>
        </section>

        {/* Section 3: Solid Content Cards (Hero + Grid) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#007aff]" />
                Crisp Solid Content Cards
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Readable, solid 24px continuous radius cards over subtle grouped background
              </p>
            </div>
            <span className="text-[12px] text-slate-400 font-mono">Component #3</span>
          </div>

          {/* Hero Continue Card */}
          <ContentCard
            isHero={true}
            title="Advanced Machine Learning: Optimization & Transformers"
            subject="Computer Science 401"
            courseColorKey="blue"
            updatedAtText="Edited 24m ago"
            pageCount={4}
            previewSnippet="Backpropagation through time, attention heads computation, multi-query key-value cache, and vector quantization."
            onClick={() => alert('Resume note clicked with spring transition')}
          />

          {/* 2-Column Responsive Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContentCard
              title="Quantum Mechanics: Wavefunctions & Operators"
              subject="Physics 302"
              courseColorKey="purple"
              updatedAtText="Edited 2h ago"
              pageCount={6}
              isPinned={true}
              previewSnippet="Schrodinger time-dependent equations, infinite square well boundary conditions, and Pauli spin matrices."
              onClick={() => sound.click()}
              onContextMenuClick={() => alert('Options: Pin, Duplicate, Export, Delete')}
            />

            <ContentCard
              title="Organic Chemistry: Stereochemistry & Reactions"
              subject="Chemistry 210"
              courseColorKey="emerald"
              updatedAtText="Yesterday"
              pageCount={3}
              previewSnippet="SN1 vs SN2 reaction pathways, chirality center assignments, Fisher projections and nucleophilic substitutions."
              onClick={() => sound.click()}
              onContextMenuClick={() => alert('Options: Pin, Duplicate, Export, Delete')}
            />
          </div>
        </section>

        {/* Section 4: Glass Intensity Controller & Hardware Diagnostics */}
        <section className="p-6 rounded-[28px] bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#007aff]" />
                Glass Intensity & Appearance Engine
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Controls real-time backdrop blur, transparency, and hardware fallback
              </p>
            </div>
            <span className="text-[12px] text-slate-400 font-mono">Component #4</span>
          </div>

          <GlassIntensitySlider />
        </section>

        {/* Section 5: Course Tint Palette Tokens */}
        <section className="space-y-3">
          <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Academic Course Palette (Tokens)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(COURSE_PALETTE).map(([key, item]) => (
              <div
                key={key}
                className="p-3 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 flex items-center gap-3 shadow-xs"
              >
                <div
                  className="w-8 h-8 rounded-xl shrink-0 shadow-sm"
                  style={{ backgroundColor: isDarkMode ? item.darkHex : item.hex }}
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {isDarkMode ? item.darkHex : item.hex}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Glass Tab Bar (Component #5) */}
      <FloatingGlassTabBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onQuickCreate={() => {
          sound.click();
          setSheetOpen(true);
        }}
      />

      {/* Liquid Glass Bottom Sheet (Component #6) */}
      <GlassSheet
        isOpen={isSheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Quick Create & Options"
        subtitle="iOS 27 Liquid Glass Bottom Sheet"
      >
        <div className="space-y-4 py-2">
          <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
            This bottom sheet renders with continuous 32px top radius, backdrop blur, grabber pill,
            and smooth spring physics conforming to Apple HIG and Android gesture insets.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                sound.click();
                setSheetOpen(false);
                setViewMode('app');
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-left hover:border-[#007aff] transition-all spring-interactive cursor-pointer group shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#007aff] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-[15px] font-semibold text-slate-900 dark:text-white">New Lecture Note</div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Typed & Markdown</div>
            </button>

            <button
              onClick={() => {
                sound.click();
                setSheetOpen(false);
                setViewMode('app');
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-left hover:border-purple-500 transition-all spring-interactive cursor-pointer group shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-[15px] font-semibold text-slate-900 dark:text-white">New Canvas Sketch</div>
              <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Fluid Stylus & S-Pen</div>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center gap-3 text-[13px] text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Accessible keyboard navigation, Esc key dismissal, and Android predictive back gesture integrated.</span>
          </div>
        </div>
      </GlassSheet>
    </div>
  );
};
