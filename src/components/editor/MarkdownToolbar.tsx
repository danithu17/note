import React, { useState } from 'react';
import {
  Heading1,
  Heading2,
  Bold,
  Italic,
  Code,
  List,
  CheckSquare,
  Quote,
  Sigma,
  Camera,
  ChevronDown,
} from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  onSnapshotDrawing: () => void;
}

const CODE_LANGUAGES = [
  { id: 'typescript', label: 'TypeScript / JS', comment: '// TypeScript code snippet' },
  { id: 'python', label: 'Python', comment: '# Python code snippet' },
  { id: 'cpp', label: 'C / C++', comment: '// C++ code snippet' },
  { id: 'java', label: 'Java', comment: '// Java code snippet' },
  { id: 'rust', label: 'Rust', comment: '// Rust code snippet' },
  { id: 'sql', label: 'SQL', comment: '-- SQL query' },
  { id: 'bash', label: 'Bash / Shell', comment: '# Shell script' },
  { id: 'json', label: 'JSON', comment: '{\n  "key": "value"\n}' },
  { id: 'html', label: 'HTML / CSS', comment: '<!-- HTML snippet -->' },
];

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsert,
  onSnapshotDrawing,
}) => {
  const [isCodeMenuOpen, setIsCodeMenuOpen] = useState(false);
  return (
    <div className="flex items-center flex-wrap gap-1 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300">
      <button
        onClick={() => onInsert('# ', '', 'Heading 1')}
        title="Heading 1"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        onClick={() => onInsert('## ', '', 'Heading 2')}
        title="Heading 2"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

      <button
        onClick={() => onInsert('**', '**', 'bold text')}
        title="Bold (Ctrl+B)"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() => onInsert('*', '*', 'italic text')}
        title="Italic (Ctrl+I)"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* Code Block with Language Dropdown */}
      <div className="relative">
        <div className="flex items-center rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors">
          <button
            onClick={() => onInsert('```typescript\n', '\n```', '// Code snippet')}
            title="Insert Code Block"
            className="p-1.5 rounded-l-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCodeMenuOpen(!isCodeMenuOpen)}
            title="Select Programming Language"
            className="p-1 pr-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {isCodeMenuOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 flex flex-col gap-0.5 z-40 animate-in fade-in zoom-in-95">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
              Insert Code Block
            </div>
            {CODE_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  onInsert(`\`\`\`${lang.id}\n`, '\n```', lang.comment);
                  setIsCodeMenuOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
              >
                <span>{lang.label}</span>
                <span className="text-[10px] text-slate-400 font-sans">{lang.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

      <button
        onClick={() => onInsert('- ', '', 'List item')}
        title="Bullet List"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => onInsert('- [ ] ', '', 'Task to complete')}
        title="Interactive Checklist"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <button
        onClick={() => onInsert('> 💡 **Key Takeaway:** ', '', 'Important lecture insight')}
        title="Key Takeaway Alert"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Quote className="w-4 h-4" />
      </button>

      <button
        onClick={() => onInsert('$$\n', '\n$$', 'E = mc^2')}
        title="Math Formula (KaTeX LaTeX)"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Sigma className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

      {/* Snapshot canvas to markdown */}
      <button
        onClick={onSnapshotDrawing}
        title="Embed current canvas drawing into lecture notes"
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
      >
        <Camera className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Snapshot Canvas</span>
      </button>
    </div>
  );
};
