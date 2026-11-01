import React, { useState } from 'react';
import {
  PenTool,
  FileText,
  Presentation,
  Volume2,
  Brain,
  ShieldCheck,
  Zap,
  Check,
  Monitor,
  Smartphone,
  HardDrive,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onOpenPricing }) => {
  const { isDarkMode, toggleDarkMode } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<'canvas' | 'editor' | 'slides' | 'audio' | 'ai'>('canvas');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const handleStartFree = () => {
    confetti({ particleCount: 50, spread: 70 });
    onLaunchApp();
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] font-sans antialiased overflow-y-auto selection:bg-[#0071e3] selection:text-white transition-colors duration-200">
      {/* 1. Apple-grade Sticky Navigation */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLaunchApp={handleStartFree}
      />

      {/* 2. Apple-grade Hero Section */}
      <HeroSection onStartFree={handleStartFree} />

      {/* 3. Live Interactive Product Showcase Tabs */}
      <section id="preview" className="py-14 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
            Interactive Product Tour
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Everything you need for lectures in one place
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Click any feature below to inspect how ScribbleNote accelerates lecture learning.
          </p>

          {/* Interactive Feature Pills Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-md mt-6 flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'canvas'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Freehand Canvas</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Typed Markdown & Math</span>
            </button>
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Slide Deck Import</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audio'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio-Synced Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Chat AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Feature Display Window */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 min-h-[380px] flex flex-col justify-between">
          {activeTab === 'canvas' && (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                  Multi-Shape Recognition Canvas
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Smooth 60fps handwriting snapping lines, circles, boxes, triangles & arrows
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Powered by sub-millisecond 2D Quadtree spatial indexing, palm rejection, pressure-sensitive pens, and intelligent multi-shape recognition.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" /> Dot matrix, ruled paper, math graph, and isometric 3D grids
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" /> Snaps rough loops into circles, rectangles, triangles, diamonds, and arrows
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500" /> Laser pointer presentation glow for lectures and study groups
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-1/2 p-6 rounded-2xl bg-slate-50 dark:bg-[#2c2c2e] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <PenTool className="w-8 h-8" />
                </div>
                <span className="font-bold text-sm">Interactive Freehand Studio</span>
                <span className="text-xs text-slate-500">Supports Stylus Tilt, Pinch-Zoom & Multi-Page Books</span>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
                  Markdown & KaTeX Math
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Type formulas, format code, and check off action items
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Full KaTeX mathematical equation rendering ($$...$$), syntax highlighting with copy buttons, interactive checklists, and lecture templates for Engineering, Medicine, and CS.
                </p>
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                  <span className="text-emerald-400">// Differential Equation Solution</span><br />
                  <span>{"$$ \\frac{dy}{dx} + P(x)y = Q(x) \\implies I(x) = e^{\\int P(x)dx} $$"}</span>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-6 rounded-2xl bg-slate-50 dark:bg-[#2c2c2e] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-3 text-center">
                <FileText className="w-12 h-12 text-emerald-500" />
                <span className="font-bold text-sm">LaTeX + Code Blocks + Checklists</span>
              </div>
            </div>
          )}

          {activeTab === 'slides' && (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                  Slide Deck Annotation
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Import professor slides (PDF) and write right over them
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Drag and drop lecture PDFs or slide decks. Each slide renders as a high-definition canvas background page so you can highlight key points, sketch diagrams, and export annotated lecture decks.
                </p>
                <button
                  onClick={handleStartFree}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Try PDF Import in Notebook
                </button>
              </div>
              <div className="w-full md:w-1/2 p-6 rounded-2xl bg-slate-50 dark:bg-[#2c2c2e] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-3 text-center">
                <Presentation className="w-12 h-12 text-blue-500" />
                <span className="font-bold text-sm">Vector Layer Annotations</span>
                <span className="text-xs text-slate-500">Export annotated PDFs with one click</span>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider">
                  Audio-Synced Recall
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Tap any handwritten stroke to hear what the professor said
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Record lectures while typing or sketching. Every vector stroke and edit is stamped with relative audio milliseconds. Missed a complex explanation? Just tap the diagram to seek directly to that exact moment.
                </p>
              </div>
              <div className="w-full md:w-1/2 p-6 rounded-2xl bg-slate-50 dark:bg-[#2c2c2e] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-3 text-center">
                <Volume2 className="w-12 h-12 text-rose-500" />
                <span className="font-bold text-sm">Timestamped Stroke Audio Sync</span>
                <span className="text-xs text-slate-500">Binary Blobs with Quota Meter</span>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">
                  iMessage-Style Chat Assistant
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Ask your lecture notes questions and generate instant flashcards
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Context-aware assistant that reads your open note, formulas, and slide pages. Summarize 2-hour lectures into executive outlines, generate spaced repetition cards, and quiz yourself before midterms.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-lg">
                    Shortcut: Cmd / Ctrl + J
                  </span>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-6 rounded-2xl bg-slate-50 dark:bg-[#2c2c2e] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-3 text-center">
                <Brain className="w-12 h-12 text-purple-500" />
                <span className="font-bold text-sm">AI Study Assistant & SM-2 Flashcards</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Bento Grid (Apple Style Architecture) */}
      <section id="features" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
            Architecture
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Built for Serious Academic Performance
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engineered with privacy, speed, and reliability from the ground up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div>
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                Zero Commercial AI Training
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your intellectual property stays yours. Your notes are stored locally in Dexie IndexedDB and are never used to train commercial AI models.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              FERPA & GDPR Compliant
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div>
              <Zap className="w-8 h-8 text-amber-500 mb-4" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                Sub-millisecond 2D Quadtree
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Spatial indexing and Ramer-Douglas-Peucker point simplification keep canvas rendering silky smooth at 60fps even with 10,000+ vector strokes.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-amber-600 dark:text-amber-400">
              O(log N) Spatial Culling
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div>
              <Flame className="w-8 h-8 text-rose-500 mb-4" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                Pomodoro Focus Hub
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Built-in study interval timers with harmonic chime synthesizer, daily study streak counters, and session tracking per subject.
              </p>
            </div>
            <span className="mt-4 text-[11px] font-mono text-rose-600 dark:text-rose-400">
              Daily Streak & Focus Stats
            </span>
          </div>
        </div>
      </section>

      {/* 5. Cross-Platform Desktop & Mobile */}
      <section id="platforms" className="py-14 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
          Available on Web, PC Desktop & Android
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10">
          One unified codebase. Same local database, instant offline availability, and multi-device cloud sync everywhere.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-md">
            <Monitor className="w-6 h-6 text-blue-500 mb-3" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">PC & Mac (Electron)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Native frameless desktop experience with offline file export and global keyboard shortcuts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-md">
            <Smartphone className="w-6 h-6 text-indigo-500 mb-3" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Android (Capacitor)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Optimized for Android tablets and foldables with S-Pen stylus pressure and native share sheets.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-md">
            <HardDrive className="w-6 h-6 text-purple-500 mb-3" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Web PWA</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Zero install required. Open in any modern browser with Workbox service worker caching.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
            Commercial Plans & Campus Lab
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Simple, Transparent Student Pricing
          </h2>

          {/* Billing Switcher */}
          <div className="inline-flex items-center bg-white dark:bg-[#1c1c1e] p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs mt-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Starter */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/80 dark:border-white/10 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Starter</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Essential local-first offline lecture notes.
              </p>
              <div className="text-2xl font-black mb-4">$0 / Rs. 0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 30 notes & 3 notebooks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Offline Dexie database</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 10 AI queries / month</li>
              </ul>
            </div>
            <button
              onClick={handleStartFree}
              className="mt-6 w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold transition-all cursor-pointer"
            >
              Launch Free
            </button>
          </div>

          {/* Pro Student */}
          <div className="p-5 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 shadow-md flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
              Student Special
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Pro Student</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Verified student discount (.edu / .ac.lk or ID).
              </p>
              <div className="text-2xl font-black mb-4">
                {billingCycle === 'annual' ? '$24.99 / yr' : '$2.99 / mo'}{' '}
                <span className="text-[11px] font-normal text-slate-400 block">or Rs. 590 / mo</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-indigo-500" /> Unlimited notes & books</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500" /> Cloud sync on all devices</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-500" /> 300 AI queries / month</li>
              </ul>
            </div>
            <button
              onClick={onOpenPricing}
              className="mt-6 w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Get Pro Student
            </button>
          </div>

          {/* Pro Scholar */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1c1c1e] border-2 border-blue-500 shadow-xl shadow-blue-500/10 flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Pro Scholar</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Full power for university students & researchers.
              </p>
              <div className="text-2xl font-black mb-4">
                {billingCycle === 'annual' ? '$39.99 / yr' : '$4.99 / mo'}{' '}
                <span className="text-[11px] font-normal text-slate-400 block">or Rs. 990 / mo</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-blue-500" /> Multi-device cloud sync</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Slide deck (PDF) markup</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Audio-synced lecture notes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> 500 AI queries & OCR search</li>
              </ul>
            </div>
            <button
              onClick={onOpenPricing}
              className="mt-6 w-full py-2.5 rounded-2xl bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Campus Lab */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-purple-200 dark:border-purple-900/60 shadow-md flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
              Campus & Labs
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Campus Lab</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                For research labs, courses, and study pods.
              </p>
              <div className="text-2xl font-black mb-4">
                $3.99 <span className="text-xs font-normal text-slate-400">/ person / mo</span>
                <span className="text-[11px] font-normal text-slate-400 block">or Rs. 790 / person / mo</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-purple-500" /> Full Pro for each person</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Shared course notebooks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Real-time collaboration</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> 100 GB pooled cloud storage</li>
              </ul>
            </div>
            <button
              onClick={onOpenPricing}
              className="mt-6 w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              Configure Lab Seats
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          🛡️ Automatic 14-day student trial with zero card requirement. Local notes are never deleted or locked.
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 border-t border-slate-200/80 dark:border-white/10 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">ScribbleNote</span>
            <span>&copy; {new Date().getFullYear()} ScribbleNote Technologies. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleStartFree} className="hover:underline cursor-pointer">
              Open App
            </button>
            <button onClick={onOpenPricing} className="hover:underline cursor-pointer">
              Pricing & Campus Lab
            </button>
            <a
              href="https://github.com/danithu17/note"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
