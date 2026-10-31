import { describe, it, expect, beforeEach } from 'vitest';
import { useAssistantStore } from '../features/assistant/useAssistantStore';
import { useCanvasStore } from '../store/useCanvasStore';
import type { LectureNote } from '../types/note';

describe('Phase 4: Apple-Grade UI & Chat-Style AI Assistant', () => {
  beforeEach(() => {
    useAssistantStore.setState({
      isOpen: false,
      isExpanded: false,
      messages: [],
      isStreaming: false,
      contextChips: [],
    });
    useCanvasStore.setState({
      viewMode: 'app',
    });
  });

  describe('Assistant Store & Context Management', () => {
    it('manages open and expanded panel states smoothly', () => {
      const { toggleAssistant, setAssistantOpen, toggleExpanded } = useAssistantStore.getState();

      expect(useAssistantStore.getState().isOpen).toBe(false);
      toggleAssistant();
      expect(useAssistantStore.getState().isOpen).toBe(true);

      toggleExpanded();
      expect(useAssistantStore.getState().isExpanded).toBe(true);

      setAssistantOpen(false);
      expect(useAssistantStore.getState().isOpen).toBe(false);
    });

    it('adds and removes context chips without duplicates', () => {
      const { addContextChip, removeContextChip, clearContextChips } = useAssistantStore.getState();

      addContextChip('Note: Physics Differential Equations');
      addContextChip('Note: Physics Differential Equations');
      addContextChip('Slide Deck Page 4');

      expect(useAssistantStore.getState().contextChips.length).toBe(2);
      expect(useAssistantStore.getState().contextChips).toContain('Slide Deck Page 4');

      removeContextChip('Slide Deck Page 4');
      expect(useAssistantStore.getState().contextChips).not.toContain('Slide Deck Page 4');

      clearContextChips();
      expect(useAssistantStore.getState().contextChips.length).toBe(0);
    });

    it('sends messages and streams contextual answers', async () => {
      const { sendMessage } = useAssistantStore.getState();

      const mockNote: LectureNote = {
        id: 'note-calc-101',
        title: 'Calculus III: Vector Fields',
        subject: 'Mathematics',
        markdown: '# Vector Fields\nCalculus lecture on divergence and curl theorem.',
        canvasElements: [],
        pages: [],
        gridType: 'dots',
        tags: ['Math', 'Calculus'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };

      await sendMessage('Summarize this note', mockNote);

      const msgs = useAssistantStore.getState().messages;
      expect(msgs.length).toBe(2);
      expect(msgs[0].role).toBe('user');
      expect(msgs[0].content).toBe('Summarize this note');
      expect(msgs[1].role).toBe('assistant');
      expect(msgs[1].content.length).toBeGreaterThan(10);
    });
  });

  describe('Landing Page View Mode Switching', () => {
    it('switches between landing page and notebook workspace', () => {
      const { setViewMode } = useCanvasStore.getState();

      expect(useCanvasStore.getState().viewMode).toBe('app');

      setViewMode('landing');
      expect(useCanvasStore.getState().viewMode).toBe('landing');

      setViewMode('app');
      expect(useCanvasStore.getState().viewMode).toBe('app');
    });
  });
});
