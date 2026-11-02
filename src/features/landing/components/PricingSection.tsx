import React, { useState } from 'react';
import { Check, Sparkles, ChevronDown, ChevronUp, GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { DEFAULT_PLANS } from '@/features/billing/entitlements';
import type { PlanId } from '@/features/billing/types';

interface PricingSectionProps {
  onStartFree: () => void;
  onSelectPlan?: (planId: PlanId) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onStartFree, onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('USD');
  const [showComparison, setShowComparison] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const studentPlan = DEFAULT_PLANS.pro_student;
  const proPlan = DEFAULT_PLANS.pro;

  const getPriceDisplay = (plan: typeof studentPlan) => {
    if (plan.id === 'free') {
      return { price: '0', period: 'forever', suffix: '' };
    }
    if (currency === 'USD') {
      if (billingCycle === 'annual') {
        const perMonth = (plan.yearlyUsd / 12).toFixed(2);
        return {
          price: `$${perMonth}`,
          period: 'per month',
          suffix: `billed annually at $${plan.yearlyUsd}/yr`,
        };
      }
      return {
        price: `$${plan.monthlyUsd}`,
        period: 'per month',
        suffix: 'billed monthly, cancel anytime',
      };
    } else {
      if (billingCycle === 'annual') {
        const perMonth = Math.round(plan.yearlyLkr / 12);
        return {
          price: `Rs. ${perMonth.toLocaleString()}`,
          period: 'per month',
          suffix: `billed annually at Rs. ${plan.yearlyLkr.toLocaleString()}/yr`,
        };
      }
      return {
        price: `Rs. ${plan.monthlyLkr.toLocaleString()}`,
        period: 'per month',
        suffix: 'billed monthly, cancel anytime',
      };
    }
  };

  const handleAction = (planId: PlanId) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      onStartFree();
    }
  };

  const handleCampusContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setShowContactModal(false);
      setContactEmail('');
    }, 3500);
  };

  return (
    <section id="pricing" className="py-24 md:py-32 px-6 sm:px-12 bg-[#fbfbfd] dark:bg-[#000000] relative">
      <div className="max-w-[1240px] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Honest, Predictable Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Simple plans for serious scholars.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
            Every account begins with a full 14-day Pro trial. No credit card required. Keep your notes forever.
          </p>

          {/* Switchers Row: Billing Cycle & Currency Switch */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {/* Monthly / Annual Switcher */}
            <div className="inline-flex items-center bg-white dark:bg-[#1a1a1e] p-1.5 rounded-full border border-slate-200/90 dark:border-white/10 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-[#0071e3] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>Annual</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  Save 33%
                </span>
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="inline-flex items-center bg-white dark:bg-[#1a1a1e] p-1.5 rounded-full border border-slate-200/90 dark:border-white/10 shadow-sm text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-slate-100 dark:bg-white/10 text-[#0071e3] dark:text-[#2997ff]'
                    : 'text-slate-500'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('LKR')}
                className={`px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  currency === 'LKR'
                    ? 'bg-slate-100 dark:bg-white/10 text-[#0071e3] dark:text-[#2997ff]'
                    : 'text-slate-500'
                }`}
              >
                LKR (Rs.)
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          {/* 1. Free Starter Card */}
          <div className="relative flex flex-col justify-between rounded-[28px] p-8 sm:p-10 bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300">
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Essential Local Note Taking
                </span>
                <h3 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mt-1">
                  Starter Free
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-[40px]">
                  Local-first handwritten and typed notes with 14-day automatic Pro trial.
                </p>
              </div>

              {/* Price Number */}
              <div className="py-4 border-y border-slate-100 dark:border-white/5 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#1d1d1f] dark:text-white">
                    {currency === 'USD' ? '$0' : 'Rs. 0'}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    / forever
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  14 days full Pro access, then auto-fallbacks to Free
                </p>
              </div>

              {/* Bullets List */}
              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  What’s included:
                </div>
                {[
                  '14-day full Pro trial included on launch',
                  'Local-first offline handwriting & Markdown notes',
                  'Up to 3 notebooks with nested tag filters',
                  'Basic canvas shapes, pen smoothing & 4 grid styles',
                  '10 minutes audio recording per note',
                  '1 PDF slide deck import with vector ink',
                  'Local JSON & image backup export',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAction('free')}
              className="w-full min-h-[48px] px-6 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white font-semibold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* 2. Pro Student (Middle / Most Popular) Card */}
          <div className="relative flex flex-col justify-between rounded-[28px] p-8 sm:p-10 bg-white dark:bg-[#18181c] border-2 border-[#0071e3] shadow-2xl shadow-blue-500/15 lg:-translate-y-2 z-10 transition-all duration-300">
            {/* Inside Badge (No clipping) */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-[#0071e3] dark:text-[#2997ff] text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Special • 50% Off</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">Verified Academic</span>
            </div>

            <div>
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-white">
                  Pro Student
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-[40px]">
                  Full lecture power with multi-device sync, audio timestamping, and AI study tutor.
                </p>
              </div>

              {/* Price Number */}
              <div className="py-4 border-y border-slate-100 dark:border-white/5 mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#0071e3] dark:text-[#2997ff]">
                    {getPriceDisplay(studentPlan).price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {getPriceDisplay(studentPlan).period}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {getPriceDisplay(studentPlan).suffix}
                </p>
              </div>

              {/* Bullets List */}
              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0071e3] dark:text-[#2997ff] mb-2">
                  Everything in Free, plus:
                </div>
                {[
                  'Unlimited notebooks, pages & lecture notes',
                  'Multi-device encrypted cloud sync across all hardware',
                  'Unlimited audio recording timestamped to each stroke',
                  'Unlimited PDF and slide deck vector annotations',
                  'AI Study Assistant with 200 curriculum queries/month',
                  'Spaced repetition flashcards & active recall review (SM-2)',
                  'High-res vector PDF, Markdown, and LaTeX export',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                    <Check className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAction('pro_student')}
              className="w-full min-h-[50px] px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] cursor-pointer"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3. Pro Scholar Card */}
          <div className="relative flex flex-col justify-between rounded-[28px] p-8 sm:p-10 bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300">
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Graduate & Research Workflows
                </span>
                <h3 className="text-2xl font-bold text-[#1d1d1f] dark:text-white mt-1">
                  Pro Scholar
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 min-h-[40px]">
                  For postgrads, professors, and engineers needing 10GB vault storage and deep AI tools.
                </p>
              </div>

              {/* Price Number */}
              <div className="py-4 border-y border-slate-100 dark:border-white/5 mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#1d1d1f] dark:text-white">
                    {getPriceDisplay(proPlan).price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {getPriceDisplay(proPlan).period}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {getPriceDisplay(proPlan).suffix}
                </p>
              </div>

              {/* Bullets List */}
              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Everything in Pro Student, plus:
                </div>
                {[
                  '10 GB high-speed cloud vault storage quota',
                  'Unlimited AI assistant queries & deep synthesis',
                  '90-day version history snapshot recovery',
                  'Advanced OCR handwriting search inside sketches',
                  'Priority multi-device background synchronization',
                  'Premium Apple-grade themes and canvas paper styles',
                  'Priority developer email & chat support',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAction('pro')}
              className="w-full min-h-[48px] px-6 rounded-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm sm:text-base transition-all active:scale-[0.98] cursor-pointer"
            >
              Start 14-Day Free Trial
            </button>
          </div>
        </div>

        {/* Collapsible Feature Comparison Matrix Button */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer shadow-xs"
          >
            <span>{showComparison ? 'Hide Detailed Feature Comparison' : 'Compare All Features in Detail'}</span>
            {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Detailed Feature Comparison Table */}
        {showComparison && (
          <div className="mt-8 rounded-[28px] overflow-hidden bg-white dark:bg-[#151518] border border-slate-200/80 dark:border-white/10 shadow-xl overflow-x-auto animate-in fade-in duration-300">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#1a1a1e]/70">
                  <th className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-700 dark:text-slate-300">Starter Free</th>
                  <th className="p-4 sm:p-5 font-bold text-[#0071e3] dark:text-[#2997ff]">Pro Student</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Pro Scholar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">14-Day Pro Trial</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Yes (No Card)</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Included</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Notebooks & Notes</td>
                  <td className="p-4 sm:p-5">3 Notebooks (30 Notes)</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Cloud Sync & Backup</td>
                  <td className="p-4 sm:p-5 text-slate-400">Local Only</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Encrypted Cloud Sync</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Priority High-Speed Sync</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Cloud Storage Vault</td>
                  <td className="p-4 sm:p-5">100 MB Local</td>
                  <td className="p-4 sm:p-5">2 GB Cloud</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-600">10 GB Cloud</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Audio Lecture Recording</td>
                  <td className="p-4 sm:p-5">10 min per note</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited Sync</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited Sync</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">PDF Slide Annotation</td>
                  <td className="p-4 sm:p-5">1 Document</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited Vector Decks</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited Vector Decks</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">AI Study Assistant</td>
                  <td className="p-4 sm:p-5">10 questions/mo</td>
                  <td className="p-4 sm:p-5">200 questions/mo</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Flashcards (Spaced Repetition)</td>
                  <td className="p-4 sm:p-5">3 decks</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited SM-2 Decks</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-600">Unlimited SM-2 Decks</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Version History Recovery</td>
                  <td className="p-4 sm:p-5 text-slate-400">None</td>
                  <td className="p-4 sm:p-5">14-day history</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-600">90-day history</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold">Commercial AI Training</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Zero (Never)</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Zero (Never)</td>
                  <td className="p-4 sm:p-5 text-emerald-600 font-bold">Zero (Never)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Campus & Institutional Banner (Replaces 4th card) */}
        <div className="mt-16 p-8 sm:p-10 rounded-[28px] bg-gradient-to-r from-slate-900 to-[#1d1d1f] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Institutional Licensing
              </span>
              <h4 className="text-xl sm:text-2xl font-bold mt-1">
                Equip your entire university, cohort, or lab
              </h4>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Bulk student seat discounts, centralized SAML / Google Workspace SSO, FERPA data compliance agreements, and dedicated support.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="min-h-[48px] px-8 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shrink-0 transition-all cursor-pointer shadow-md"
          >
            Contact Campus Team
          </button>
        </div>

        {/* Campus Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 relative">
              {contactSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    Thank you!
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Our academic partnership coordinator will be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCampusContact} className="space-y-4">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    Campus & Institutional Inquiries
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tell us your university or school department and estimated student seats.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="dean@university.edu"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      className="flex-1 py-3 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      Send Inquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
