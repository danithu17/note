import React from 'react';
import { Pin, Clock, BookOpen, ChevronRight, MoreHorizontal } from 'lucide-react';
import { sound } from '@/utils/sound';
import { hapticsPlatform } from '@/platform';
import { COURSE_PALETTE } from '../glassTokens';

interface ContentCardProps {
  id?: string;
  title: string;
  subject?: string;
  courseColorKey?: string;
  updatedAtText?: string;
  pageCount?: number;
  previewSnippet?: string;
  thumbnailUrl?: string;
  isPinned?: boolean;
  isHero?: boolean;
  onClick?: () => void;
  onContextMenuClick?: (e: React.MouseEvent) => void;
  className?: string;
  children?: React.ReactNode;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subject = 'General Lecture',
  courseColorKey = 'blue',
  updatedAtText = 'Edited recently',
  pageCount = 1,
  previewSnippet,
  thumbnailUrl,
  isPinned = false,
  isHero = false,
  onClick,
  onContextMenuClick,
  className = '',
  children,
}) => {
  const colorToken = COURSE_PALETTE[courseColorKey] || COURSE_PALETTE.blue;

  const handleClick = () => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    if (onClick) onClick();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.click();
    hapticsPlatform.impact('medium').catch(() => {});
    if (onContextMenuClick) onContextMenuClick(e);
  };

  if (isHero) {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Continue reading ${title}`}
        className={`liquid-content-card p-5 sm:p-6 cursor-pointer group spring-interactive select-none relative overflow-hidden ${className}`}
      >
        {/* Subtle Course Color Ambient Rim */}
        <div
          className="absolute top-0 left-0 bottom-0 w-2.5 rounded-l-[24px]"
          style={{ backgroundColor: colorToken.hex }}
        />

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          {/* Real Thumbnail Slot */}
          <div className="w-full sm:w-44 h-32 sm:h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500">
                <BookOpen className="w-8 h-8 stroke-[1.5]" />
                <span className="text-[11px] font-mono font-medium">Page 1 Preview</span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
              {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
            </div>
          </div>

          {/* Hero Meta & Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${colorToken.badgeBg} ${colorToken.badgeText}`}
              >
                {subject}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                {updatedAtText}
              </span>
              {isPinned && (
                <span className="p-1 rounded-md bg-amber-500/10 text-amber-500">
                  <Pin className="w-3 h-3 fill-amber-500" />
                </span>
              )}
            </div>

            <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-[#007aff] dark:group-hover:text-[#0a84ff] transition-colors">
              {title}
            </h3>

            {previewSnippet && (
              <p className="text-[14px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {previewSnippet}
              </p>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
                Tap to resume where you left off
              </span>
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-[#007aff] group-hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Grid Card
  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Note: ${title}`}
      className={`liquid-content-card p-4 cursor-pointer group spring-interactive select-none relative flex flex-col justify-between overflow-hidden min-h-[160px] ${className}`}
    >
      {/* Top Bar with Subject & Context Menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[130px] ${colorToken.badgeBg} ${colorToken.badgeText}`}
        >
          {subject}
        </span>
        <div className="flex items-center gap-1">
          {isPinned && (
            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          )}
          {onContextMenuClick && (
            <button
              onClick={handleContextMenu}
              aria-label="Note options"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Title & Preview */}
      <div className="flex-1 my-1">
        <h4 className="text-[16px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#007aff] dark:group-hover:text-[#0a84ff] transition-colors">
          {title}
        </h4>
        {previewSnippet && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {previewSnippet}
          </p>
        )}
      </div>

      {children}

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-white/5 mt-2">
        <span className="truncate">{updatedAtText}</span>
        <span>{pageCount} p.</span>
      </div>
    </div>
  );
};
