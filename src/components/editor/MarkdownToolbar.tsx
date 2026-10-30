import React from 'react';
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
} from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  onSnapshotDrawing: () => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsert,
  onSnapshotDrawing,
}) => {
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

      <button
        onClick={() => onInsert('```typescript\n', '\n```', '// Code snippet')}
        title="Code Block"
        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Code className="w-4 h-4" />
      </button>

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
