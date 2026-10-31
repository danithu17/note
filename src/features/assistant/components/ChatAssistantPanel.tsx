import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Square,
  Copy,
  Check,
  Plus,
  Maximize2,
  Minimize2,
  Trash2,
  FileText,
  Brain,
  Mic,
  MicOff,
} from 'lucide-react';
import { useAssistantStore } from '../useAssistantStore';
import { useNoteStore } from '@/store/useNoteStore';
import { db } from '@/core/db';
import confetti from 'canvas-confetti';
import { sound } from '@/utils/sound';

export const ChatAssistantPanel: React.FC = () => {
  const {
    isOpen,
    isExpanded,
    messages,
    isStreaming,
    contextChips,
    setAssistantOpen,
    toggleExpanded,
    removeContextChip,
    sendMessage,
    stopStreaming,
    clearHistory,
    addContextChip,
  } = useAssistantStore();

  const { getActiveNote, updateMarkdown, createNote, selectNote } = useNoteStore();
  const activeNote = getActiveNote();

  const [input, setInput] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-add active note to context chips if not already present
  useEffect(() => {
    if (activeNote && !contextChips.some((c) => c.startsWith('Note:'))) {
      addContextChip(`Note: ${activeNote.title || 'Untitled Note'}`);
    }
  }, [activeNote, addContextChip, contextChips]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global keyboard shortcut: Cmd/Ctrl + J to toggle assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        useAssistantStore.getState().toggleAssistant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendMessage(text, activeNote);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    sound.pop();
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleInsertIntoNote = (content: string) => {
    if (!activeNote) return;
    const appended = `${activeNote.markdown}\n\n### 🤖 AI Study Notes\n${content}\n`;
    updateMarkdown(appended);
    sound.pop();
    confetti({ particleCount: 30, spread: 50 });
    alert('✅ Inserted into note!');
  };

  const handleSaveAsNewNote = async (content: string) => {
    const titleMatch = content.match(/^#+\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'AI Study Note';
    const newId = await createNote(title, activeNote?.subject || 'AI Notes');
    await useNoteStore.getState().updateMarkdown(content);
    selectNote(newId);
    sound.pop();
    confetti({ particleCount: 40, spread: 60 });
    alert(`🎉 Created new note: "${title}"`);
  };

  const handleAddAsFlashcards = async (content: string) => {
    if (!activeNote) return;

    // Parse simple Q/A patterns from content
    const qaRegex = /(?:Q:|\*\*Q:\*\*|\*\*Question(?:\s*\d*)?:\*\*)\s*([^\n]+)[\s\S]*?(?:A:|\*\*A:\*\*|\*\*Answer:\*\*)\s*([^\n]+)/gi;
    let match;
    let count = 0;

    while ((match = qaRegex.exec(content)) !== null) {
      const q = match[1].trim();
      const a = match[2].trim();
      if (q && a) {
        await db.flashcards.add({
          id: 'fc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          noteId: activeNote.id,
          question: q,
          answer: a,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: Date.now(),
        });
        count++;
      }
    }

    if (count > 0) {
      confetti({ particleCount: 35, spread: 50 });
      alert(`🎉 Added ${count} flashcards to your spaced repetition deck!`);
    } else {
      // Fallback: create flashcard from message
      await db.flashcards.add({
        id: 'fc_' + Date.now().toString(36),
        noteId: activeNote.id,
        question: `Summary review: ${activeNote.title}`,
        answer: content.substring(0, 300) + '...',
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReviewDate: Date.now(),
      });
      alert('🎉 Created flashcard from response!');
    }
  };

  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice dictation is supported in Chrome, Safari, and Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const suggestions = [
    'Summarize this note',
    'Make flashcards',
    'Explain key formulas',
    'Quiz me on this lecture',
    'Clean up into structured outline',
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 right-0 z-40 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border-l border-slate-200/80 dark:border-white/10 flex flex-col shadow-2xl transition-all duration-300 ease-in-out select-none ${
        isExpanded ? 'w-full md:w-[680px]' : 'w-full sm:w-[420px]'
      }`}
    >
      {/* Apple-grade Header */}
      <div className="h-14 px-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Study Assistant
              </span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded-md">
                AI
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {activeNote ? activeNote.title : 'Ready to help'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearHistory}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={toggleExpanded}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors hidden sm:block"
            title={isExpanded ? 'Collapse to Side Panel' : 'Expand Assistant View'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setAssistantOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Close Assistant [Cmd/Ctrl+J]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1 max-w-[90%] sm:max-w-[85%] ${
                isUser ? 'self-end' : 'self-start'
              }`}
            >
              {/* Context Chips (if sent with user message) */}
              {isUser && msg.contextChips && msg.contextChips.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mb-1">
                  {msg.contextChips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-full"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              {/* Speech Bubble */}
              <div
                className={`p-3.5 rounded-3xl leading-relaxed text-xs sm:text-sm select-text whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#007aff] dark:bg-[#0a84ff] text-white rounded-br-md shadow-sm'
                    : 'bg-slate-100 dark:bg-[#2c2c2e] text-slate-900 dark:text-white rounded-bl-md shadow-xs'
                }`}
              >
                {msg.content || (
                  <span className="inline-flex items-center gap-1.5 text-slate-400 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                    Analyzing notes...
                  </span>
                )}
              </div>

              {/* Assistant Message Action Buttons */}
              {!isUser && !msg.isStreaming && msg.content && (
                <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    title="Copy response"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {activeNote && (
                    <button
                      onClick={() => handleInsertIntoNote(msg.content)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors"
                      title="Insert directly into current lecture note"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Insert</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSaveAsNewNote(msg.content)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors"
                    title="Save response as a separate note"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Save Note</span>
                  </button>

                  <button
                    onClick={() => handleAddAsFlashcards(msg.content)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/40 dark:hover:text-purple-400 transition-colors"
                    title="Convert into SM-2 spaced repetition cards"
                  >
                    <Brain className="w-3 h-3" />
                    <span>Flashcards</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-white/5">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(sug);
              sendMessage(sug, activeNote);
            }}
            disabled={isStreaming}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 text-[11px] whitespace-nowrap font-medium transition-colors"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Context Chips Attached to Active Input */}
      {contextChips.length > 0 && (
        <div className="px-4 py-1.5 flex items-center gap-1.5 flex-wrap bg-slate-50/80 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-white/5">
          <span className="text-[10px] font-bold uppercase text-slate-400">Context:</span>
          {contextChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20"
            >
              <span className="truncate max-w-[180px]">{chip}</span>
              <button
                onClick={() => removeContextChip(chip)}
                className="hover:text-blue-800 dark:hover:text-white"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Pill-shaped Input Bar */}
      <div className="p-3 bg-white dark:bg-[#1c1c1e] border-t border-slate-200/80 dark:border-white/10 shrink-0">
        <div className="flex items-end gap-1.5 p-1.5 bg-slate-100 dark:bg-[#2c2c2e] rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-2xs">
          {/* Voice Input Mic */}
          <button
            onClick={handleMicToggle}
            className={`p-2 rounded-full transition-colors ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
            title={isListening ? 'Listening...' : 'Voice Dictation'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Multiline auto-expanding textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask your notes, quiz me, or summarize..."
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none py-1.5 px-1 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
          />

          {/* Send / Stop Streaming Button */}
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="p-2 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm hover:scale-105 active:scale-95 transition-all"
              title="Stop Generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2 rounded-full transition-all ${
                input.trim()
                  ? 'bg-[#007aff] dark:bg-[#0a84ff] text-white shadow-sm hover:scale-105 active:scale-95'
                  : 'text-slate-400 opacity-40 cursor-not-allowed'
              }`}
              title="Send Message [Enter]"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-slate-400">
          <span>Enter to send • Shift+Enter for newline</span>
          <span>Cmd/Ctrl+J to toggle</span>
        </div>
      </div>
    </aside>
  );
};
