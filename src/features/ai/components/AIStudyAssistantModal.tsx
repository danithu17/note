import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  HelpCircle,
  MessageSquare,
  Check,
  CheckCircle2,
  XCircle,
  Copy,
  BookOpen,
} from 'lucide-react';
import { useNoteStore } from '@/store/useNoteStore';
import { aiAssistant, type AISummaryResult, type AIQuizQuestion } from '../aiService';
import { ModalPortal } from '@/components/ui/ModalPortal';
import confetti from 'canvas-confetti';

interface AIStudyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIStudyAssistantModal: React.FC<AIStudyAssistantModalProps> = ({ isOpen, onClose }) => {
  const { getActiveNote, updateMarkdown } = useNoteStore();
  const activeNote = getActiveNote();

  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'ask'>('summary');
  const [summaryData, setSummaryData] = useState<AISummaryResult | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<AIQuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !activeNote) return null;

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const res = await aiAssistant.summarizeNote(activeNote);
      setSummaryData(res);
      confetti({ particleCount: 25, spread: 40 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await aiAssistant.generateQuizFromNote(activeNote);
      setQuizQuestions(res);
      setSelectedAnswers({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const res = await aiAssistant.askNotes(searchQuery.trim(), activeNote);
      setAskAnswer(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppendSummaryToNote = async () => {
    if (!summaryData) return;
    const addition = `\n\n### 🤖 AI Study Summary\n${summaryData.summary}\n\n**Key Takeaways:**\n${summaryData.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n`;
    await updateMarkdown(activeNote.markdown + addition);
    setIsCopied(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <ModalPortal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  AI Study Assistant & Tutor
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                {activeNote.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-1.5 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary & Key Takeaways</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('ask')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ask'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask My Notes</span>
          </button>
        </div>

        {/* Tab 1: Summary */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {!summaryData ? (
              <div className="text-center py-10 flex flex-col items-center gap-3 text-slate-400">
                <BookOpen className="w-10 h-10 stroke-1 text-purple-400" />
                <span className="text-xs max-w-sm">
                  Click below to generate an executive lecture summary, key formulas, and exam takeaways from this note.
                </span>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Synthesizing Notes...' : 'Generate Lecture Summary'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/60 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Executive Summary
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {summaryData.summary}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Key Exam Takeaways
                  </span>
                  <ul className="flex flex-col gap-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                    {summaryData.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {summaryData.keyTerms && summaryData.keyTerms.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Core Terminology
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {summaryData.keyTerms.map((t, idx) => (
                        <div key={idx} className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700">
                          <strong className="text-purple-600 dark:text-purple-400 block mb-0.5">{t.term}</strong>
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">{t.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAppendSummaryToNote}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Appended to Lecture Note!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Append Summary to Lecture Notes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quiz */}
        {activeTab === 'quiz' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {quizQuestions.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center gap-3 text-slate-400">
                <HelpCircle className="w-10 h-10 stroke-1 text-purple-400" />
                <span className="text-xs max-w-sm">
                  Test your understanding. The AI assistant extracts 3 multiple choice questions based on your lecture note.
                </span>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Generating Questions...' : 'Start Practice Quiz'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5 text-xs">
                {quizQuestions.map((q, qIdx) => {
                  const userAnswer = selectedAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-3"
                    >
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        Q{qIdx + 1}. {q.question}
                      </span>

                      <div className="flex flex-col gap-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          const isCorrect = optIdx === q.correctIndex;
                          const hasAnswered = userAnswer !== undefined;

                          return (
                            <button
                              key={optIdx}
                              disabled={hasAnswered}
                              onClick={() =>
                                setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })
                              }
                              className={`p-2.5 rounded-xl text-left transition-all border text-xs flex items-center justify-between ${
                                hasAnswered
                                  ? isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold'
                                    : isSelected
                                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200'
                                    : 'opacity-50 border-slate-200 dark:border-slate-700'
                                  : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                              )}
                              {hasAnswered && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {userAnswer !== undefined && (
                        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-[11px] text-purple-700 dark:text-purple-300">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ask My Notes */}
        {activeTab === 'ask' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-xs">
            <form onSubmit={handleAskNotes} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything about this lecture (e.g. What is the invariant?)..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-purple-500 text-xs"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Ask'}
              </button>
            </form>

            {askAnswer ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Assistant Response
                </span>
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {askAnswer}
                </p>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-700" />
                <span>Type any question above to search concepts and formulas across this lecture note.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </ModalPortal>
  );
};
