import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How does the 14-day free trial work?',
    answer:
      'Every new account automatically gets full access to all Pro features for 14 days without entering any credit card or payment information. When the 14 days finish, your account simply transitions to the Starter Free plan. We will never lock your notebooks, delete your drawings, or surprise you with an unwanted charge.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, absolutely. You can cancel your subscription with a single click at any time from your Account Settings. You will retain full Pro access until the end of your current billing period, after which your account gracefully moves to the Free tier without losing any local notes or sketches.',
  },
  {
    question: 'How do I verify student status for the Pro Student discount?',
    answer:
      'Any student with an official educational email domain (e.g. .edu, .ac.uk, .ac.lk, .edu.au) is verified automatically upon signing up. If your university uses a standard domain, you can simply upload a picture of your student ID card in the billing modal for instant verification.',
  },
  {
    question: 'Does ScribbleNote work completely offline?',
    answer:
      'Yes. ScribbleNote is built offline-first using Dexie IndexedDB. All handwritten canvas strokes, markdown notes, formula renderings, and notebooks are stored directly on your local device storage. You can take notes on airplanes, in underground lecture halls, or off-grid. When you reconnect to Wi-Fi, your changes synchronize automatically.',
  },
  {
    question: 'Is my lecture data used to train commercial AI models?',
    answer:
      'Strictly NO. Your notes, research papers, formulas, and audio recordings remain 100% your intellectual property. We do not sell user data, and we never use your personal notes or lecture transcripts to train commercial AI models. Our architecture strictly complies with FERPA and GDPR academic privacy standards.',
  },
  {
    question: 'What is your refund policy?',
    answer:
      'We want you to love studying with ScribbleNote. If you purchase any paid Pro plan and decide it does not fit your learning workflow, email support@scribblenote.app within 7 days of payment and our team will issue a 100% refund, no questions asked.',
  },
  {
    question: 'Which devices and styluses are supported?',
    answer:
      'ScribbleNote runs on Web (Chrome, Safari, Edge, Firefox), iPadOS and Android tablets with full Apple Pencil and Samsung S-Pen pressure and tilt sensitivity. We also provide native desktop builds for macOS and Windows with global hotkeys and multi-window views.',
  },
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 md:py-32 px-6 sm:px-12 bg-white dark:bg-[#0a0a0c] border-t border-slate-200/80 dark:border-white/5 relative">
      <div className="max-w-[880px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] text-sm font-semibold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
            Clear answers about trials, billing, privacy, and offline capabilities.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-[#151518] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  id={`faq-btn-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => toggle(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle(index);
                    }
                  }}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                >
                  <span className="text-base sm:text-lg font-semibold text-[#1d1d1f] dark:text-white">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-blue-500/10 text-[#0071e3]' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-btn-${index}`}
                    className="px-6 pb-6 sm:px-7 sm:pb-7 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-white/5 pt-4 animate-in fade-in duration-200"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
