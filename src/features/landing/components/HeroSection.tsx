import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  CheckCircle2,
  FileText,
  Presentation,
  Volume2,
  Wand2,
  Brain,
  PenTool,
  Eraser,
  Highlighter,
} from 'lucide-react';
import { DemoVideoModal } from './DemoVideoModal';

interface HeroSectionProps {
  onStartFree: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartFree }) => {
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeCanvasColor, setActiveCanvasColor] = useState<string>('#0071e3');

  return (
    <section className="relative pt-16 md:pt-24 pb-20 md:pb-32 px-6 md:px-12 overflow-hidden flex flex-col items-center text-center">
      {/* Subtle Apple-style Ambient Backdrop Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[1000px] h-[450px] bg-gradient-to-tr from-blue-500/12 via-indigo-500/10 to-violet-500/10 blur-[130px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-[1280px] w-full mx-auto flex flex-col items-center">
        {/* 1. Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-[#0071e3] dark:text-blue-400 text-[14px] font-semibold mb-8 shadow-xs animate-in fade-in duration-500">
          <Sparkles className="w-4 h-4 shrink-0 fill-current" />
          <span>Free for 14 days, no card needed</span>
        </div>

        {/* 2. Huge Fluid Clamp H1 */}
        <h1 className="text-[clamp(44px,7vw,88px)] font-bold tracking-[-0.03em] leading-[1.05] text-[#1d1d1f] dark:text-[#f5f5f7] max-w-5xl">
          Typed notes. Natural handwriting.{' '}
          <span className="bg-gradient-to-r from-[#0071e3] via-indigo-600 to-violet-600 dark:from-[#2997ff] dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
            Audio and slides in one canvas.
          </span>
        </h1>

        {/* 3. 20px Sub-headline (2 lines max) */}
        <p className="mt-7 text-[19px] md:text-[20px] leading-[1.6] text-[#1d1d1f]/75 dark:text-[#f5f5f7]/75 max-w-3xl font-normal">
          The all-in-one local-first workspace for university students and researchers.
          Capture lectures, annotate slides, and sync audio with zero friction.
        </p>

        {/* 4. Two CTA Buttons */}
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap w-full max-w-md sm:max-w-none">
          <button
            onClick={onStartFree}
            className="w-full sm:w-auto min-h-[48px] h-14 px-8 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[16px] font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Start free trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setDemoOpen(true)}
            className="w-full sm:w-auto min-h-[48px] h-14 px-8 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/15 dark:border-white/15 hover:bg-black/[0.03] dark:hover:bg-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7] text-[16px] font-semibold shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-[#0071e3] dark:text-blue-400" />
            <span>Watch 60s demo</span>
          </button>
        </div>

        {/* 5. Trust Row (3 small checks) */}
        <div className="mt-9 flex items-center justify-center gap-6 sm:gap-10 text-[14px] sm:text-[15px] text-[#1d1d1f]/70 dark:text-[#f5f5f7]/70 flex-wrap">
          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>100% Offline IndexedDB</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Zero AI training on your notes</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Instant multi-device sync</span>
          </div>
        </div>

        {/* 6. LARGE Product Mockup (at least 1100px wide on desktop, full-bleed on mobile) */}
        <div className="mt-14 md:mt-20 w-full max-w-[1180px] mx-auto text-left relative group">
          {/* Subtle Ambient Backing Glow under Window */}
          <div
            className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-600/20 rounded-[32px] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity -z-10"
            aria-hidden="true"
          />

          <div className="w-full rounded-[24px] md:rounded-[28px] bg-white dark:bg-[#18181b] border border-black/10 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
            {/* macOS / iPad Header Bar */}
            <div className="px-5 py-3.5 bg-[#f5f5f7]/90 dark:bg-[#202023]/90 border-b border-black/[0.08] dark:border-white/10 flex items-center justify-between">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f] inline-block shadow-xs" />
                <span className="ml-3 text-[14px] font-semibold text-slate-700 dark:text-slate-200 font-mono hidden sm:inline-block">
                  CS301 — Deep Learning & Neural Architectures.note
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[#0071e3] dark:text-blue-400 text-[14px] font-bold">
                  Split Hybrid View
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[14px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Audio Rec 12:44</span>
                </span>
              </div>
            </div>

            {/* App Split Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] bg-[#fafafa] dark:bg-[#121214]">
              {/* Left Column: Sidebar Snippet */}
              <div className="hidden xl:block lg:col-span-3 p-4 border-r border-black/[0.08] dark:border-white/10 bg-[#fbfbfd] dark:bg-[#161618]">
                <div className="text-[14px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3 px-2">
                  Academic Notebooks
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0071e3] dark:text-blue-400 font-semibold text-[14px]">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Deep Learning (Active)</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Linear Algebra III</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Presentation className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Medical Imaging Slides</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Volume2 className="w-4 h-4 shrink-0 text-slate-400" />
                    <span>Audio Transcripts</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Markdown & Math Editor */}
              <div className="lg:col-span-6 xl:col-span-5 p-6 border-r border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#18181b] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[14px] text-slate-400 dark:text-slate-500 mb-2 font-medium">
                    <span>Week 4</span>
                    <span>•</span>
                    <span>Prof. Harrison</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Synced to Audio</span>
                  </div>

                  <h3 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                    Lecture 07: Backpropagation & Loss Optimization
                  </h3>

                  {/* Math Formula Callout */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[14px] my-4 border border-slate-800 shadow-inner">
                    <div className="text-emerald-400 text-[14px] font-sans font-bold uppercase tracking-wider mb-1">
                      // Stochastic Gradient Update
                    </div>
                    <div className="text-blue-300 text-[15px] font-semibold py-1">
                      {'$$ w_{t+1} = w_t - \\eta \\nabla L(w_t) $$'}
                    </div>
                  </div>

                  {/* Checklist */}
                  <ul className="space-y-2 text-[14px] text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
                      <span>Compute forward pass activations through hidden layers</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
                      <span>Apply chain rule on softmax cross-entropy loss</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
                      <span>Decay learning rate scheduler after 20 epochs</span>
                    </li>
                  </ul>
                </div>

                {/* Audio Sync Pill at Bottom of Editor */}
                <div className="mt-6 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between text-[14px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-rose-950 dark:text-rose-200 text-[14px]">
                        Tap handwritten stroke to seek audio
                      </div>
                      <div className="text-[14px] text-rose-700 dark:text-rose-300">
                        Linked with vector canvas Page 1
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[14px] text-rose-600 dark:text-rose-400 font-bold px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/40">
                    12:44 / 45:00
                  </span>
                </div>
              </div>

              {/* Right Column: Visual Canvas & Assistant */}
              <div className="lg:col-span-6 xl:col-span-4 p-6 bg-[#fbfbfd] dark:bg-[#121214] relative flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Canvas Header */}
                  <div className="flex items-center justify-between text-[14px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5 text-[#0071e3] dark:text-blue-400 font-semibold">
                      <Wand2 className="w-4 h-4" /> Auto-Shape Active
                    </span>
                    <span>Dot Matrix Grid (5mm)</span>
                  </div>

                  {/* Auto-shape Snapped Box Graphic */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-[#0071e3]/50 bg-blue-50/40 dark:bg-blue-950/20 text-center relative overflow-hidden">
                    <div className="flex items-center justify-center gap-2 text-[14px] font-bold text-[#0071e3] dark:text-blue-400">
                      <span>Neural Node Boundary</span>
                    </div>
                    <div className="mt-2 text-[14px] text-slate-600 dark:text-slate-400 font-mono">
                      Hand-drawn curve snapped to rectangle (x: 120, y: 84)
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    </div>
                  </div>

                  {/* iMessage-Style Study Assistant Chat Bubble */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/10 shadow-sm flex flex-col gap-2.5 text-[14px]">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-[14px]">
                      <Brain className="w-4 h-4" />
                      <span>Study Assistant</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[14px]">
                      "I noticed your gradient formula above! Would you like me to generate 5 flashcards for backpropagation?"
                    </p>
                    <div className="flex gap-2 pt-1 flex-wrap">
                      <button
                        onClick={onStartFree}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[14px] font-semibold border border-purple-300/40 dark:border-purple-800/40 transition-colors cursor-pointer"
                      >
                        Generate Flashcards
                      </button>
                      <button
                        onClick={onStartFree}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[14px] font-semibold transition-colors cursor-pointer"
                      >
                        Explain Step-by-Step
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Pen Island Toolbar */}
                <div className="mt-6 p-2 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/10 shadow-lg flex items-center justify-around">
                  <button
                    aria-label="Pen tool"
                    className="p-2 rounded-xl bg-blue-500/10 text-[#0071e3] transition-colors"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Highlighter tool"
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Highlighter className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Eraser tool"
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                  <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                  <button
                    onClick={() => setActiveCanvasColor('#0071e3')}
                    aria-label="Select Blue Color"
                    className={`w-5 h-5 rounded-full bg-[#0071e3] transition-transform ${
                      activeCanvasColor === '#0071e3' ? 'scale-125 ring-2 ring-blue-400' : ''
                    }`}
                  />
                  <button
                    onClick={() => setActiveCanvasColor('#ef4444')}
                    aria-label="Select Red Color"
                    className={`w-5 h-5 rounded-full bg-rose-500 transition-transform ${
                      activeCanvasColor === '#ef4444' ? 'scale-125 ring-2 ring-rose-400' : ''
                    }`}
                  />
                  <button
                    onClick={() => setActiveCanvasColor('#10b981')}
                    aria-label="Select Green Color"
                    className={`w-5 h-5 rounded-full bg-emerald-500 transition-transform ${
                      activeCanvasColor === '#10b981' ? 'scale-125 ring-2 ring-emerald-400' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 60s Demo Modal */}
      <DemoVideoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onStartFree={onStartFree}
      />
    </section>
  );
};
