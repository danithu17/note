import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Mail, Globe } from 'lucide-react';

interface FooterSectionProps {
  onStartFree: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onStartFree }) => {
  return (
    <footer className="w-full bg-[#111114] text-[#f5f5f7] relative overflow-hidden">
      {/* 1. Final High-Contrast Dark CTA Band */}
      <div className="py-24 sm:py-32 px-6 sm:px-12 border-b border-white/10 relative">
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-[880px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-[#2997ff] text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Learning Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Ready to transform how you learn in lectures?
          </h2>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Free for 14 days with no card required. Keep all your notes and local vector sketches forever.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onStartFree}
              className="w-full sm:w-auto min-h-[52px] px-8 sm:px-10 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/30 active:scale-[0.98] cursor-pointer"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <span>•</span>
            <span>14-day automatic Pro access</span>
            <span>•</span>
            <span>Zero commercial AI training</span>
          </div>
        </div>
      </div>

      {/* 2. Structured Footer Columns */}
      <div className="py-16 sm:py-20 px-6 sm:px-12 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 sm:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ScribbleNote</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The Apple-grade hybrid lecture workspace combining fluid vector handwriting, typed markdown, audio timestamping, and active recall study tools.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href="https://github.com/nimjayad/note"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:support@scribblenote.app"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Contact Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features Bento
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#platforms" className="hover:text-white transition-colors">
                  Cross-Platform Apps
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing & Student Plan
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ & Policies
                </a>
              </li>
            </ul>
          </div>

          {/* Platforms Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Platforms</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <span className="text-slate-300">Web PWA</span>{' '}
                <span className="text-[11px] text-emerald-400 font-semibold ml-1">Live</span>
              </li>
              <li>
                <span className="text-slate-300">Android Tablet</span>{' '}
                <span className="text-[11px] text-blue-400 font-semibold ml-1">Beta</span>
              </li>
              <li>
                <span className="text-slate-300">Desktop Electron</span>{' '}
                <span className="text-[11px] text-amber-400 font-semibold ml-1">Soon</span>
              </li>
              <li>
                <a href="#platforms" className="hover:text-white transition-colors">
                  Join Waitlist
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Legal & Trust</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#ferpa" className="hover:text-white transition-colors">
                  FERPA Compliance
                </a>
              </li>
              <li>
                <a href="#gdpr" className="hover:text-white transition-colors">
                  GDPR & Local-First
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ScribbleNote Technologies. Designed with precision for scholars.
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
              <span>English (US / Global)</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for academic learners
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
