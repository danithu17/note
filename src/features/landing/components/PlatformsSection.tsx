import React, { useState } from 'react';
import { Globe, Smartphone, Monitor, CheckCircle2, Clock, ArrowRight, Mail, Sparkles, Check } from 'lucide-react';

interface PlatformCard {
  id: string;
  name: string;
  tagline: string;
  status: 'available' | 'in_testing' | 'coming_soon';
  statusLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  actionLabel: string;
  actionType: 'launch' | 'waitlist';
  badgeColor: string;
}

const PLATFORMS: PlatformCard[] = [
  {
    id: 'web',
    name: 'Web & Tablet PWA',
    tagline: 'Runs in any modern browser with instant zero-install launch',
    status: 'available',
    statusLabel: 'Available Now',
    icon: Globe,
    features: [
      'Full offline capability via IndexedDB',
      'Optimized for iPad Safari & Chrome stylus gestures',
      'Automatic service worker background updates',
      'Zero storage overhead on your device',
    ],
    actionLabel: 'Launch Web App',
    actionType: 'launch',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'android',
    name: 'Android Tablet & Foldable',
    tagline: 'Built with Capacitor for deep stylus and system integration',
    status: 'in_testing',
    statusLabel: 'Public Beta',
    icon: Smartphone,
    features: [
      'Samsung S-Pen pressure & tilt sensitivity',
      'Native back gesture & system theme matching',
      'Direct PDF share sheet receiver',
      'Android 11+ tablet split-screen support',
    ],
    actionLabel: 'Try Android Beta',
    actionType: 'waitlist',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20',
  },
  {
    id: 'desktop',
    name: 'Desktop (macOS & Windows)',
    tagline: 'Native frameless desktop performance powered by Electron',
    status: 'coming_soon',
    statusLabel: 'Coming Soon',
    icon: Monitor,
    features: [
      'Frameless Apple window design & blur header',
      'System-wide global hotkeys (Cmd/Ctrl + Shift + S)',
      'Local JSON & SQLite backup vault export',
      'Multi-window side-by-side lecture notes',
    ],
    actionLabel: 'Join Desktop Waitlist',
    actionType: 'waitlist',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
  },
];

interface PlatformsSectionProps {
  onLaunchApp: () => void;
}

export const PlatformsSection: React.FC<PlatformsSectionProps> = ({ onLaunchApp }) => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPlatform, setWaitlistPlatform] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim() || !waitlistEmail.includes('@')) return;

    // Save to local storage waitlist cache
    try {
      const existing = JSON.parse(localStorage.getItem('scribblenote_waitlist') || '[]');
      existing.push({
        email: waitlistEmail.trim(),
        platform: waitlistPlatform || 'all',
        timestamp: Date.now(),
      });
      localStorage.setItem('scribblenote_waitlist', JSON.stringify(existing));
    } catch {
      // ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setWaitlistEmail('');
      setWaitlistPlatform(null);
    }, 4000);
  };

  return (
    <section id="platforms" className="py-24 md:py-32 px-6 sm:px-12 bg-white dark:bg-[#0a0a0c] border-t border-slate-200/80 dark:border-white/5 relative">
      <div className="max-w-[1240px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cross-Platform Reach</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Available everywhere you study.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
            One unified codebase. Same local database, instant offline availability, and synced notes on all your hardware.
          </p>
        </div>

        {/* 3 Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className="relative flex flex-col justify-between rounded-[28px] p-8 sm:p-10 bg-slate-50/70 dark:bg-[#151518] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1f1f24] border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff] shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${platform.badgeColor}`}
                    >
                      {platform.status === 'available' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{platform.statusLabel}</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] dark:text-white mb-2">
                    {platform.name}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {platform.tagline}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    {platform.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div>
                  {platform.actionType === 'launch' ? (
                    <button
                      type="button"
                      onClick={onLaunchApp}
                      className="w-full min-h-[48px] px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      <span>{platform.actionLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setWaitlistPlatform(platform.name)}
                      className="w-full min-h-[48px] px-6 rounded-full bg-white dark:bg-[#222228] hover:bg-slate-100 dark:hover:bg-[#2a2a32] text-slate-900 dark:text-white font-semibold text-sm sm:text-base border border-slate-300 dark:border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span>{platform.actionLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Waitlist Modal / Strip */}
        {waitlistPlatform && (
          <div className="mt-12 p-8 rounded-[28px] bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 max-w-2xl mx-auto text-center">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
                <h4 className="text-xl font-bold">You are on the priority list!</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  We will email you the moment the {waitlistPlatform} release is available.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <h4 className="text-xl font-bold text-[#1d1d1f] dark:text-white">
                  Get early access to {waitlistPlatform}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Be the first to download the build and receive complimentary beta benefits.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center max-w-md mx-auto">
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Enter your university or personal email"
                    className="w-full min-h-[48px] px-4 rounded-full bg-white dark:bg-[#1a1a1e] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-h-[48px] px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm shrink-0 transition-colors cursor-pointer"
                  >
                    Notify Me
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setWaitlistPlatform(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mt-2 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
