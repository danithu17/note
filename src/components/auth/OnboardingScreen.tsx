import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import confetti from 'canvas-confetti';

const STUDY_ROLES = [
  'University Student',
  'Medical Student',
  'Engineering Student',
  'Academic Researcher',
  'Professor / Educator',
  'Software Engineer',
  'Lifelong Learner',
];

const POPULAR_SUBJECTS = [
  'Computer Science',
  'Medicine & Biology',
  'Physics & Calculus',
  'Law & Jurisprudence',
  'Economics & Finance',
  'Chemistry',
  'Psychology',
];

export const OnboardingScreen: React.FC = () => {
  const { user, completeOnboarding } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [selectedRole, setSelectedRole] = useState(STUDY_ROLES[0]);
  const [customRole, setCustomRole] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(POPULAR_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalRole = customRole.trim() || selectedRole;
    const finalSubject = customSubject.trim() || selectedSubject;

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });

      await completeOnboarding({
        name: name.trim() || user?.name || 'Scholar',
        studyRole: finalRole,
        subject: finalSubject,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-y-auto flex flex-col items-center justify-center p-4 sm:p-6 bg-[#f5f5f7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 font-sans">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-purple-500/15 blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-lg bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Welcome to ScribbleNote
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Let's personalize your workspace and configure your study assistant.
          </p>
        </div>

        {/* 14-Day Free Pro Trial Activated Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 flex items-center gap-3.5 text-xs text-slate-800 dark:text-slate-200">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-slate-900 dark:text-white block">
              14-Day Pro Scholar Trial Activated!
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Enjoy 10 GB Cloud Storage, AI Note Summaries, and Infinite Multi-Page Canvas with zero payment required.
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
          {/* Display Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              How should we address you?
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name or preferred nickname"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* What you study or do */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>What do you study or do?</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STUDY_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setCustomRole('');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    selectedRole === role && !customRole
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Main Subject or Field */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Primary academic focus or subject</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(sub);
                    setCustomSubject('');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    selectedSubject === sub && !customSubject
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter your custom field (e.g. Astrophysics, Architecture)..."
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500 text-slate-900 dark:text-white text-xs placeholder:text-slate-400"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Complete Setup & Enter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
