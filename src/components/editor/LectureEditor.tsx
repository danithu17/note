import React, { useState, useRef } from 'react';
import {
  FileText,
  Eye,
  Tag,
  BookOpen,
  Calendar,
  Copy,
  Check,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { useNoteStore } from '../../store/useNoteStore';
import { useCanvasStore } from '../../store/useCanvasStore';
import { MarkdownToolbar } from './MarkdownToolbar';
import { LectureRecorder } from '../audio/LectureRecorder';
import { exportCanvasToSvg } from '../../utils/export';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

const LECTURE_TEMPLATES = [
  {
    name: 'CS / Coding Lecture',
    content: `## 📌 Topic: Data Structures & Algorithms
**Instructor:** Prof. Smith
**Prerequisites:** Basic programming logic

### 🎯 Core Concepts
- Concept 1: Asymptotic complexity
- Concept 2: Memory layout & pointers

\`\`\`typescript
// Algorithm Implementation
function solution(input: number[]): number {
  let result = 0;
  for (const x of input) {
    result += x;
  }
  return result;
}
\`\`\`

> 💡 **Key Takeaway:** Always evaluate worst-case vs average-case time bounds!

### 📝 Action Items & Exercises
- [ ] Implement iterative version
- [ ] Calculate space complexity
`,
  },
  {
    name: 'Physics / Math Lecture',
    content: `## 📌 Topic: Calculus & Differential Equations
**Lecture #:** 04
**Objective:** Solving first-order non-linear differential equations

### 📐 Mathematical Formulation
$$
\\frac{dy}{dx} + P(x)y = Q(x)
$$

Integrating Factor:
$$
I(x) = e^{\\int P(x)dx}
$$

> 💡 **Exam Tip:** Remember to multiply both sides of the equation by $I(x)$ before integrating!

### 🔍 Verification Steps
- [ ] Differentiate solution to verify
- [ ] Check boundary conditions at $t = 0$
`,
  },
  {
    name: 'Medical / Biology Notes',
    content: `## 📌 Topic: Human Physiology & Nervous System
**System:** Central & Peripheral Nervous Systems

### 🔬 Cellular Anatomy
- **Neuron Structure:** Dendrites, Soma, Axon Hillock, Myelin Sheath, Synaptic Terminals.
- **Action Potential Phase:**
  1. Depolarization ($Na^+$ influx)
  2. Repolarization ($K^+$ efflux)
  3. Hyperpolarization refractory period

> 💡 **Clinical Pearl:** Demyelinating disorders drastically slow down saltatory conduction.

### 📋 Study Checklist
- [ ] Label neuron diagram on right visual canvas
- [ ] Compare sympathetic vs parasympathetic responses
`,
  },
];

export const LectureEditor: React.FC = () => {
  const {
    getActiveNote,
    updateTitle,
    updateSubject,
    updateTags,
    updateMarkdown,
  } = useNoteStore();

  const { isDarkMode } = useCanvasStore();
  const activeNote = getActiveNote();

  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('edit');
  const [newTagInput, setNewTagInput] = useState('');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  if (!activeNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
        <FileText className="w-12 h-12 mb-3 opacity-30" />
        <h3 className="text-lg font-semibold">No Note Selected</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Select a lecture note from the sidebar or press Ctrl+N to create one.
        </p>
      </div>
    );
  }

  // Word count & Reading time calculation
  const words = activeNote.markdown.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));

  // Insert markdown snippet at cursor
  const handleInsertSnippet = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = activeNote.markdown;

    const selectedText = current.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const updated = current.substring(0, start) + replacement + current.substring(end);
    updateMarkdown(updated);
    sound.click();

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Snapshot active canvas elements into markdown
  const handleSnapshotCanvas = () => {
    if (activeNote.canvasElements.length === 0) {
      alert('Draw something on the visual canvas first to embed a snapshot!');
      return;
    }

    const svg = exportCanvasToSvg(activeNote.canvasElements, 800, 500, false, isDarkMode);
    const base64Svg = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    const snapshotMarkdown = `\n\n### 🎨 Diagram Snapshot (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})\n![Lecture Sketch](${base64Svg})\n\n`;

    updateMarkdown(activeNote.markdown + snapshotMarkdown);
    sound.pop();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
  };

  // Insert lecture template
  const handleApplyTemplate = (templateContent: string) => {
    updateMarkdown(activeNote.markdown + '\n\n' + templateContent);
    setIsTemplateMenuOpen(false);
    sound.pop();
    confetti({ particleCount: 20, spread: 40 });
  };

  // Add tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const trimmed = newTagInput.trim().replace(/^#/, '');
      if (!activeNote.tags.includes(trimmed)) {
        updateTags([...activeNote.tags, trimmed]);
        sound.click();
      }
      setNewTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    updateTags(activeNote.tags.filter((t) => t !== tagToRemove));
    sound.click();
  };

  // Toggle checklist checkbox in preview mode
  const handleToggleCheckbox = (lineIndex: number) => {
    const lines = activeNote.markdown.split('\n');
    let targetCheckboxIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (/^(\s*)-\s*\[([ xX])\]\s*(.*)$/.test(lines[i])) {
        if (targetCheckboxIndex === lineIndex) {
          if (lines[i].includes('- [ ]')) {
            lines[i] = lines[i].replace('- [ ]', '- [x]');
          } else {
            lines[i] = lines[i].replace(/- \[[xX]\]/, '- [ ]');
          }
          break;
        }
        targetCheckboxIndex++;
      }
    }

    updateMarkdown(lines.join('\n'));
    sound.click();
  };

  // Copy code block content
  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    sound.pop();
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Quick parser to render Markdown preview
  const renderMarkdownPreview = () => {
    const lines = activeNote.markdown.split('\n');
    let checkboxCount = 0;
    let codeBlockIdx = 0;
    let inCodeBlock = false;
    let codeBlockLanguage = '';
    let codeBlockContent: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      // Check code block fences
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const currentCode = codeBlockContent.join('\n');
          const thisCodeIdx = codeBlockIdx++;
          const isCopied = copiedCodeIdx === thisCodeIdx;

          elements.push(
            <div
              key={`code-${idx}`}
              className="my-3 rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-xl relative group"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                  {codeBlockLanguage || 'Code'}
                </span>
                <button
                  onClick={() => handleCopyCode(currentCode, thisCodeIdx)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre">{currentCode}</pre>
            </div>
          );
          codeBlockContent = [];
        } else {
          inCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Checklists
      const checkMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
      if (checkMatch) {
        const isChecked = checkMatch[2].toLowerCase() === 'x';
        const itemText = checkMatch[3];
        const currentCheckboxIdx = checkboxCount++;

        elements.push(
          <div
            key={`check-${idx}`}
            onClick={() => handleToggleCheckbox(currentCheckboxIdx)}
            className="flex items-start gap-2.5 my-1.5 cursor-pointer group hover:bg-slate-100/70 dark:hover:bg-slate-800/70 p-1.5 rounded-xl transition-colors"
          >
            <input
              type="checkbox"
              checked={isChecked}
              readOnly
              className="mt-1 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <span
              className={`text-sm ${
                isChecked
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {itemText}
            </span>
          </div>
        );
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-5 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 tracking-tight">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> 💡') || line.startsWith('> ')) {
        // Callout / Key Takeaway
        elements.push(
          <div
            key={idx}
            className="my-3 p-3.5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-sm leading-relaxed shadow-xs"
          >
            {line.replace(/^>\s*/, '')}
          </div>
        );
      } else if (line.startsWith('$$')) {
        // Math formula block
        elements.push(
          <div
            key={idx}
            className="my-2 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-blue-900 dark:text-blue-300 font-mono text-sm text-center shadow-xs"
          >
            {line}
          </div>
        );
      } else if (line.match(/^!\[(.*?)\]\((.*?)\)/)) {
        // Embedded Image / Drawing
        const match = line.match(/^!\[(.*?)\]\((.*?)\)/);
        if (match) {
          elements.push(
            <div key={idx} className="my-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <img src={match[2]} alt={match[1]} className="w-full h-auto max-h-96 object-contain bg-white dark:bg-slate-900" />
            </div>
          );
        }
      } else if (line.startsWith('- ')) {
        // Bullet list
        elements.push(
          <li key={idx} className="ml-5 list-disc text-sm text-slate-700 dark:text-slate-300 my-0.5">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={idx} className="my-4 border-slate-200 dark:border-slate-800" />);
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        // Normal paragraph
        elements.push(
          <p key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Note Header Metadata */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Subject badge */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <input
              type="text"
              value={activeNote.subject}
              onChange={(e) => updateSubject(e.target.value)}
              placeholder="Course / Subject..."
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-0 outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Templates Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden sm:inline">Templates</span>
              </button>

              {isTemplateMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1 z-30 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                    Insert Lecture Template
                  </div>
                  {LECTURE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      onClick={() => handleApplyTemplate(tmpl.content)}
                      className="text-left px-3 py-2 rounded-xl text-xs hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View switcher: Edit / Preview */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setEditorMode('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  editorMode === 'edit'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setEditorMode('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  editorMode === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Lecture Title..."
          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 bg-transparent border-0 outline-none focus:ring-0 placeholder:text-slate-400"
        />

        {/* Tags, Word Count, and timestamp row */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-mono text-[11px] mr-2">
            {new Date(activeNote.updatedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mr-2">
            <Clock className="w-3 h-3" />
            {words} words • ~{readingTimeMin} min
          </span>

          {/* Tags list */}
          {activeNote.tags.map((tag) => (
            <span
              key={tag}
              onClick={() => handleRemoveTag(tag)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 cursor-pointer transition-colors"
              title="Click to remove tag"
            >
              #{tag} &times;
            </span>
          ))}

          {/* Add tag input */}
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="+ add tag..."
              className="bg-transparent text-[11px] outline-none text-slate-600 dark:text-slate-300 placeholder:text-slate-400 w-20"
            />
          </div>
        </div>

        {/* Integrated Lecture Audio Recorder Widget */}
        <LectureRecorder />

        {/* Markdown Quick Formatting Toolbar */}
        {editorMode === 'edit' && (
          <MarkdownToolbar
            onInsert={handleInsertSnippet}
            onSnapshotDrawing={handleSnapshotCanvas}
          />
        )}
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {editorMode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={activeNote.markdown}
            onChange={(e) => updateMarkdown(e.target.value)}
            placeholder="Type lecture notes, markdown, math formulas ($$ ... $$), or paste code..."
            className="w-full h-full resize-none bg-transparent border-0 outline-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 selection:bg-blue-100 dark:selection:bg-blue-900/60"
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            {renderMarkdownPreview()}
          </div>
        )}
      </div>
    </div>
  );
};
