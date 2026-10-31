import { create } from 'zustand';
import type { ChatMessage } from './types';
import type { LectureNote } from '../../types/note';
import { aiAssistant } from '../ai/aiService';
import { sound } from '../../utils/sound';

interface AssistantState {
  isOpen: boolean;
  isExpanded: boolean;
  messages: ChatMessage[];
  isStreaming: boolean;
  contextChips: string[];
  abortController: AbortController | null;

  toggleAssistant: () => void;
  setAssistantOpen: (open: boolean) => void;
  toggleExpanded: () => void;
  addContextChip: (chip: string) => void;
  removeContextChip: (chip: string) => void;
  clearContextChips: () => void;
  sendMessage: (text: string, activeNote?: LectureNote | null) => Promise<void>;
  stopStreaming: () => void;
  clearHistory: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content:
      "Hello! I'm your ScribbleNote AI Study Assistant. I'm connected to your active lecture notes, handwritten formulas, and slides. How can I help you study today?",
    timestamp: Date.now() - 60000,
  },
];

export const useAssistantStore = create<AssistantState>((set, get) => ({
  isOpen: false,
  isExpanded: false,
  messages: INITIAL_MESSAGES,
  isStreaming: false,
  contextChips: [],
  abortController: null,

  toggleAssistant: () => {
    sound.click();
    set((state) => ({ isOpen: !state.isOpen }));
  },

  setAssistantOpen: (isOpen) => set({ isOpen }),

  toggleExpanded: () => {
    sound.pop();
    set((state) => ({ isExpanded: !state.isExpanded }));
  },

  addContextChip: (chip) => {
    if (!get().contextChips.includes(chip)) {
      set((state) => ({ contextChips: [...state.contextChips, chip] }));
    }
  },

  removeContextChip: (chip) => {
    set((state) => ({ contextChips: state.contextChips.filter((c) => c !== chip) }));
  },

  clearContextChips: () => set({ contextChips: [] }),

  sendMessage: async (text: string, activeNote?: LectureNote | null) => {
    if (!text.trim()) return;

    sound.pop();
    const userMsgId = 'usr_' + Date.now().toString(36);
    const assistantMsgId = 'ast_' + (Date.now() + 1).toString(36);

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
      contextChips: [...get().contextChips],
    };

    // Add user message & empty assistant placeholder for streaming
    set((state) => ({
      messages: [
        ...state.messages,
        userMessage,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isStreaming: true,
        },
      ],
      isStreaming: true,
    }));

    const controller = new AbortController();
    set({ abortController: controller });

    try {
      // Generate intelligent contextual response
      let fullResponseText = '';
      const promptLower = text.toLowerCase();

      if (promptLower.includes('summar') && activeNote) {
        const sum = await aiAssistant.summarizeNote(activeNote);
        fullResponseText = `### 📌 Executive Lecture Summary: ${activeNote.title}\n\n${sum.summary}\n\n#### 🎯 Key Takeaways\n${sum.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n#### 📚 Key Concepts\n${sum.keyTerms.map((k) => `- **${k.term}**: ${k.definition}`).join('\n')}`;
      } else if ((promptLower.includes('quiz') || promptLower.includes('test')) && activeNote) {
        const quiz = await aiAssistant.generateQuizFromNote(activeNote);
        fullResponseText = `### 🧠 Lecture Knowledge Check\n\n` +
          quiz.map((q, idx) => `**Question ${idx + 1}: ${q.question}**\n${q.options.map((opt, oIdx) => `- [ ] ${String.fromCharCode(65 + oIdx)}) ${opt}`).join('\n')}\n*💡 Explanation: ${q.explanation}*`).join('\n\n');
      } else if (promptLower.includes('flashcard') && activeNote) {
        const cards = await aiAssistant.generateFlashcardsFromNote(activeNote);
        fullResponseText = `### 📇 Generated Spaced Repetition Flashcards\n\n` +
          cards.map((c, idx) => `**Card ${idx + 1}**\n- **Q:** ${c.question}\n- **A:** ${c.answer}`).join('\n\n');
      } else if (activeNote) {
        const answer = await aiAssistant.askMyNotes(activeNote, text);
        fullResponseText = answer;
      } else {
        fullResponseText = `I understand you're asking about "${text}". Open or select a lecture note from your sidebar so I can analyze its content, formulas, and slide attachments directly!`;
      }

      // Stream tokens smoothly at 25ms intervals
      const tokens = fullResponseText.split(' ');
      let currentOutput = '';

      for (let i = 0; i < tokens.length; i++) {
        if (controller.signal.aborted) break;

        currentOutput += (i > 0 ? ' ' : '') + tokens[i];
        const partial = currentOutput;

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, content: partial, isStreaming: i < tokens.length - 1 } : m
          ),
        }));

        await new Promise((r) => setTimeout(r, 22));
      }
    } catch {
      if (!controller.signal.aborted) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: '⚠️ Assistant needs internet connection or active note context.',
                  isStreaming: false,
                }
              : m
          ),
        }));
      }
    } finally {
      set({ isStreaming: false, abortController: null });
    }
  },

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set((state) => ({
      isStreaming: false,
      abortController: null,
      messages: state.messages.map((m) => ({ ...m, isStreaming: false })),
    }));
  },

  clearHistory: () => {
    sound.click();
    set({ messages: INITIAL_MESSAGES });
  },
}));
