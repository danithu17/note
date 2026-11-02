import React from 'react';
import { PenTool, FolderSync, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';

interface Step {
  number: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
  gradient: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    badge: 'Input Any Format',
    title: 'Capture your thoughts seamlessly',
    description:
      'Type markdown or math equations, draw freehand diagrams with auto-snapping shapes, record lecture audio, or import PDF slide decks. Everything lives side-by-side on an infinite hybrid workspace.',
    icon: PenTool,
    highlights: [
      'Multi-shape handwriting snapping (lines, boxes, circles)',
      'Timestamped lecture audio synced with each stroke',
      'PDF slide import with multi-page vector annotations',
    ],
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
  },
  {
    number: '02',
    badge: 'Local-First Hierarchy',
    title: 'Organize without folder clutter',
    description:
      'Group notes by course, semester, or research topic. Indexed locally in Dexie IndexedDB with zero cloud lag, full offline access, and automatic end-to-end background sync across all your devices.',
    icon: FolderSync,
    highlights: [
      'Workspaces, colored notebooks, and nested tag filters',
      'Sub-millisecond local search across titles, markdown, and OCR',
      'Encrypted cloud synchronization with version history snapshots',
    ],
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
  },
  {
    number: '03',
    badge: 'Active Recall AI',
    title: 'Study smarter with spaced repetition',
    description:
      'Turn dense 2-hour lecture transcripts into clear executive summaries. Generate SM-2 spaced repetition flashcards with one click and tap any sketch to replay exactly what your professor said.',
    icon: BrainCircuit,
    highlights: [
      'One-click flashcard generation with active recall review',
      'Context-aware study assistant that knows your curriculum',
      'High-resolution PDF, Markdown, and LaTeX vector exports',
    ],
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 sm:px-12 bg-[#fbfbfd] dark:bg-[#000000] relative">
      <div className="max-w-[1240px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow Simplified</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            How ScribbleNote works. In three simple steps.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
            From the opening lecture slide to final exam review, your knowledge flows effortlessly.
          </p>
        </div>

        {/* 3 Steps Stacked Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative flex flex-col justify-between rounded-[28px] p-8 sm:p-10 bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-none transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
              >
                {/* Step Top Badge & Number */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#0071e3]/80 dark:text-[#2997ff]">
                      {step.number}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon Box */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] mb-6">
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Highlights list */}
                <div className="pt-6 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                  {step.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
