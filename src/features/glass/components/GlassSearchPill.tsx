import React from 'react';
import { Search, Mic } from 'lucide-react';
import { hapticsPlatform } from '@/platform';
import { sound } from '@/utils/sound';

interface GlassSearchPillProps {
  placeholder?: string;
  onClick?: () => void;
  onVoiceClick?: () => void;
  value?: string;
  onChange?: (val: string) => void;
  isReadOnly?: boolean;
  className?: string;
}

export const GlassSearchPill: React.FC<GlassSearchPillProps> = ({
  placeholder = 'Search notes, handwriting, PDFs...',
  onClick,
  onVoiceClick,
  value,
  onChange,
  isReadOnly = true,
  className = '',
}) => {
  const handleClick = () => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    if (onClick) onClick();
  };

  const handleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.click();
    hapticsPlatform.impact('medium').catch(() => {});
    if (onVoiceClick) onVoiceClick();
    else if (onClick) onClick();
  };

  return (
    <div
      onClick={isReadOnly ? handleClick : undefined}
      role={isReadOnly ? 'button' : undefined}
      tabIndex={isReadOnly ? 0 : undefined}
      aria-label="Search notes"
      className={`liquid-glass-control flex items-center gap-3 px-4 py-3 rounded-full shadow-lg spring-interactive cursor-pointer select-none group w-full ${className}`}
    >
      <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-[#007aff] transition-colors shrink-0" />

      {isReadOnly ? (
        <span className="flex-1 text-[16px] text-slate-400 dark:text-slate-500 font-normal truncate">
          {value || placeholder}
        </span>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[16px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none selectable-text"
        />
      )}

      <button
        type="button"
        onClick={handleVoice}
        aria-label="Voice search dictation"
        title="Voice Search"
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-[#007aff] transition-colors shrink-0 cursor-pointer"
      >
        <Mic className="w-4 h-4" />
      </button>
    </div>
  );
};
