import React from 'react';
import { sound } from '@/utils/sound';
import { hapticsPlatform } from '@/platform';

interface GlassChipProps {
  label: string;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const GlassChip: React.FC<GlassChipProps> = ({
  label,
  count,
  isSelected = false,
  onClick,
  icon,
  className = '',
}) => {
  const handleClick = () => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      role="checkbox"
      aria-checked={isSelected}
      className={`liquid-glass-control inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium spring-interactive select-none cursor-pointer border transition-all ${
        isSelected
          ? 'bg-[#007aff]/15 text-[#007aff] dark:bg-[#0a84ff]/25 dark:text-[#0a84ff] border-[#007aff]/35 dark:border-[#0a84ff]/40 shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-white/40 dark:border-white/10 hover:border-slate-300'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span
          className={`ml-0.5 text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
            isSelected
              ? 'bg-[#007aff] text-white dark:bg-[#0a84ff]'
              : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
