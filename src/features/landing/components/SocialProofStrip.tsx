import React from 'react';
import { GraduationCap, Quote, Star, Users } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  institution: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Tapping my lecture sketches to jump to that exact second of the professor’s explanation completely changed how I study for midterms.',
    author: 'Kavindu Senanayake',
    role: 'Computer Science & AI',
    institution: 'Beta User • University of Colombo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      'I import 60-page medicine slide decks directly into the canvas. Drawing anatomy diagrams over slides with zero lag is unbeatable.',
    author: 'Sarah Chen',
    role: 'Biomedical Engineering',
    institution: 'Beta User • MIT Student Cohort',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
  },
  {
    quote:
      'Having full offline Dexie storage means I can take notes during 3-hour lab exams in basement lecture halls with zero Wi-Fi panic.',
    author: 'Marcus Vance',
    role: 'Mechanical Systems',
    institution: 'Beta User • Stanford Scholar Lab',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
];

const INSTITUTIONS = [
  'Stanford University',
  'MIT School of Science',
  'Oxford Academic',
  'Univ. of Colombo',
  'Cambridge Tech',
];

export const SocialProofStrip: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0c0c0e] border-y border-black/[0.06] dark:border-white/10 transition-colors">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Strip Header with Beta Stat */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[14px] font-semibold mb-4">
            <Users className="w-4 h-4 text-[#0071e3] dark:text-blue-400" />
            <span>Over 4,800 active beta student notebooks</span>
          </div>

          <h2 className="text-[26px] md:text-[34px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Built for ambitious students and researchers
          </h2>
          <p className="mt-2 text-[16px] text-slate-500 dark:text-slate-400">
            Trusted in lecture halls and study pods across engineering, medicine, and mathematics.
          </p>
        </div>

        {/* Institution Placeholder Marquee Row */}
        <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap opacity-75 grayscale hover:grayscale-0 transition-all duration-300 mb-16">
          {INSTITUTIONS.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-[15px] tracking-wide"
            >
              <GraduationCap className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              <span>{name}</span>
            </div>
          ))}
        </div>

        {/* Testimonials Grid (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-7 md:p-8 rounded-[24px] bg-[#fbfbfd] dark:bg-[#18181b] border border-black/[0.08] dark:border-white/10 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-blue-500/20 dark:text-blue-400/20 mb-2" />
                <p className="text-[15px] sm:text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed font-normal">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/10 flex items-center gap-3.5">
                <img
                  src={t.avatar}
                  alt={t.author}
                  loading="lazy"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover border border-black/10 dark:border-white/10"
                />
                <div className="text-left">
                  <div className="font-bold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t.author}
                  </div>
                  <div className="text-[14px] text-slate-500 dark:text-slate-400">
                    {t.role} • {t.institution}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-[14px] text-slate-400 dark:text-slate-500">
          * Beta student testimonials collected during ScribbleNote Campus Pre-Release.
        </div>
      </div>
    </section>
  );
};
