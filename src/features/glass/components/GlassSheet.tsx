import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { sound } from '@/utils/sound';
import { hapticsPlatform } from '@/platform';

interface GlassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export const GlassSheet: React.FC<GlassSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[85vh]',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end select-none animate-in fade-in duration-200"
    >
      {/* Translucent Backdrop Scrim */}
      <div
        onClick={handleDismiss}
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Floating Glass Sheet Container */}
      <div
        className={`relative z-10 w-full max-w-2xl mx-auto liquid-glass-control rounded-t-[32px] border-b-0 shadow-2xl flex flex-col ${maxHeight} overflow-hidden animate-in slide-in-from-bottom duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${className}`}
      >
        {/* Centered Grabber / Drag Handle Pill */}
        <div className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700/80" />
        </div>

        {/* Optional Header */}
        {(title || subtitle) && (
          <div className="flex items-center justify-between px-6 py-2 border-b border-slate-200/50 dark:border-white/5">
            <div>
              {title && (
                <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Close sheet"
              className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sheet Content Area (solid/readable interior) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
