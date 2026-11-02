import React from 'react';
import {
  Wand2,
  FileCode,
  Volume2,
  Presentation,
  Brain,
  WifiOff,
  Layers,
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const FeatureBentoGrid: React.FC = () => {
  return (
    <section id="features" className="py-24 md:py-32 px-6 md:px-12 bg-[#fbfbfd] dark:bg-[#000000] transition-colors">
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] dark:text-blue-400 text-[14px] font-semibold mb-4 border border-blue-500/20">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Engineered for Lecture Hall Speed</span>
          </div>

          <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.1]">
            Every lecture tool you ever wished for. All in one canvas.
          </h2>
          <p className="mt-4 text-[18px] md:text-[20px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            No more switching between handwriting apps, voice recorders, PDF readers, and AI tutors.
          </p>
        </div>

        {/* Bento Grid: 8 Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: Handwriting that Snaps (Large 7 cols) */}
          <div className="md:col-span-7 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden relative group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#0071e3] dark:text-blue-400 flex items-center justify-center mb-5">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Handwriting that snaps into shapes
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Draw rough circles, arrows, boxes, or triangles. ScribbleNote instantly recognizes and converts your hand-drawn stroke into crisp vector geometry.
              </p>
            </div>

            {/* Visual: Interactive shape transformation showcase */}
            <div className="mt-8 p-5 rounded-2xl bg-[#f5f5f7] dark:bg-[#202023] border border-black/5 dark:border-white/5 relative min-h-[160px] flex items-center justify-around">
              {/* Rough hand-drawn sketch */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-20 rounded-2xl border-2 border-dashed border-rose-400 flex items-center justify-center bg-rose-50/50 dark:bg-rose-950/20 rotate-[-4deg]">
                  <span className="text-[14px] font-mono text-rose-500 font-bold">Wobbly loop</span>
                </div>
                <span className="text-[14px] font-medium text-slate-400">Your hand sketch</span>
              </div>

              <div className="flex flex-col items-center justify-center text-[#0071e3] font-bold text-[14px]">
                <span className="animate-pulse">⟶</span>
                <span className="text-[14px] font-mono">Snap 12ms</span>
              </div>

              {/* Snapped geometric shape */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-20 rounded-2xl border-2 border-[#0071e3] bg-blue-500/10 flex items-center justify-center shadow-md relative">
                  <span className="text-[14px] font-mono text-[#0071e3] dark:text-blue-400 font-bold">Clean Box</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute -top-1 -left-1" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute -top-1 -right-1" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute -bottom-1 -left-1" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute -bottom-1 -right-1" />
                </div>
                <span className="text-[14px] font-medium text-slate-400">Auto-vectorized</span>
              </div>
            </div>
          </div>

          {/* Tile 2: Typed Markdown & Math (5 cols) */}
          <div className="md:col-span-5 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Typed markdown + KaTeX math
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Seamlessly type equations with LaTeX syntax, format code blocks, and check off lecture action items.
              </p>
            </div>

            {/* Visual: Formatted formula box */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[14px] shadow-inner border border-slate-800">
              <div className="text-emerald-400 text-[14px] font-sans font-bold">// Gaussian Integral</div>
              <div className="text-blue-300 py-2 text-[15px] font-bold">
                {'$$ \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi} $$'}
              </div>
              <div className="text-slate-400 text-[14px] flex items-center gap-2 pt-1 border-t border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Rendered via KaTeX Engine
              </div>
            </div>
          </div>

          {/* Tile 3: Audio Synced to Notes (6 cols) */}
          <div className="md:col-span-6 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Audio synced to your notes
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Record the professor while you sketch. Every stroke is timestamped. Tap any equation to replay what was said at that exact millisecond.
              </p>
            </div>

            {/* Visual: Audio waveform scrubber */}
            <div className="mt-6 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40">
              <div className="flex items-center justify-between text-[14px] font-semibold text-rose-700 dark:text-rose-300 mb-2">
                <span>Lecture Recording: Physics II</span>
                <span className="font-mono">24:18 / 50:00</span>
              </div>
              <div className="h-8 flex items-center gap-1.5 px-2">
                {[40, 65, 30, 85, 95, 60, 45, 75, 100, 70, 50, 80, 60, 90, 40, 70, 85, 35, 55, 65].map(
                  (val, i) => (
                    <div
                      key={i}
                      style={{ height: `${val}%` }}
                      className={`flex-1 rounded-full transition-all ${
                        i <= 10 ? 'bg-rose-500' : 'bg-rose-300/40 dark:bg-rose-800/40'
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Tile 4: PDF & Slides Annotation (6 cols) */}
          <div className="md:col-span-6 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                PDF and slides annotation
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Import lecture slide decks. Slides render as high-definition background canvas pages so you can write and highlight directly on top.
              </p>
            </div>

            {/* Visual: Slide Deck mockup with highlighter markup */}
            <div className="mt-6 p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#202023] border border-black/5 dark:border-white/5 relative">
              <div className="flex items-center justify-between text-[14px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
                <span>Slide 14 of 42</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 font-semibold text-[14px]">
                  PDF Layer Active
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#18181b] shadow-xs text-[14px]">
                <span className="font-bold">Neural Architecture: Transformer Attention</span>
                <div className="mt-2 p-1.5 rounded-md bg-amber-200/60 dark:bg-amber-400/20 text-amber-900 dark:text-amber-200 inline-block font-semibold">
                  Key Exam Question: Multi-Head Scaled Dot Product
                </div>
              </div>
            </div>
          </div>

          {/* Tile 5: AI Assistant Chat (Large 7 cols) */}
          <div className="md:col-span-7 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                AI assistant chat inside your note
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                Ask questions about your handwritten diagrams or typed slides. Generate flashcards, summarize two-hour lectures, and quiz yourself on demand.
              </p>
            </div>

            {/* Visual: iMessage-style Chat Bubble Mockup */}
            <div className="mt-6 space-y-3 p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#202023] border border-black/5 dark:border-white/5">
              <div className="flex justify-end">
                <div className="p-3 rounded-2xl rounded-tr-xs bg-[#0071e3] text-white text-[14px] max-w-xs shadow-xs">
                  "Explain how gradient clipping prevents exploding gradients."
                </div>
              </div>
              <div className="flex justify-start">
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] text-[14px] max-w-sm shadow-xs">
                  <div className="font-bold text-[#0071e3] text-[14px] mb-1">Study Assistant</div>
                  It rescales gradients when their $L_2$ norm exceeds a threshold $c$:
                  <div className="font-mono text-[14px] text-blue-600 dark:text-blue-400 mt-1">
                    {'$$ g \\leftarrow g \\cdot \\frac{c}{\\|g\\|} $$'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tile 6: Offline-First with Sync (5 cols) */}
          <div className="md:col-span-5 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                100% offline-first with sync
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Your notes are stored locally in Dexie IndexedDB. The app opens instantly without Wi-Fi and syncs the second you reconnect.
              </p>
            </div>

            {/* Visual: Offline status indicator */}
            <div className="mt-6 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-[14px] text-amber-950 dark:text-amber-200">
                  Local Database Ready
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-200/60 dark:bg-amber-900/40 text-[14px] font-mono font-bold text-amber-900 dark:text-amber-300">
                IndexedDB
              </span>
            </div>
          </div>

          {/* Tile 7: Study Tools (Flashcards/Quiz) (6 cols) */}
          <div className="md:col-span-6 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Study tools: flashcards & quiz
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Turn raw lecture slides into spaced-repetition SM-2 review decks. Track retention score per subject and ace finals.
              </p>
            </div>

            {/* Visual: Flashcard Flip Preview */}
            <div className="mt-6 p-4 rounded-2xl bg-[#f5f5f7] dark:bg-[#202023] border border-black/5 dark:border-white/5 flex items-center justify-between text-[14px]">
              <div>
                <span className="text-[14px] uppercase font-bold text-slate-400">Card 3 / 20</span>
                <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-0.5">
                  What is the role of softmax cross-entropy?
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-[#0071e3] text-white text-[14px] font-bold shrink-0">
                Flip Answer
              </span>
            </div>
          </div>

          {/* Tile 8: Export Anywhere (6 cols) */}
          <div className="md:col-span-6 p-8 md:p-10 rounded-[28px] bg-white dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-[22px] md:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Export anywhere, anytime
              </h3>
              <p className="mt-2 text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Export notes as high-resolution annotated PDFs, clean Markdown, vector SVGs, or complete portable JSON database backups.
              </p>
            </div>

            {/* Visual: File formats row */}
            <div className="mt-6 flex items-center gap-2.5 flex-wrap">
              {['Annotated PDF', 'Markdown (.md)', 'Vector SVG', 'High-Res PNG', 'Full Backup'].map(
                (fmt) => (
                  <span
                    key={fmt}
                    className="px-3.5 py-2 rounded-xl bg-[#f5f5f7] dark:bg-[#202023] text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/5 text-[14px] font-medium"
                  >
                    {fmt}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
