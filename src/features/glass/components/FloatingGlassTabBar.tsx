import React, { useRef } from 'react';
import { Home, FileText, PenTool, Sparkles, Flame, Plus } from 'lucide-react';
import { hapticsPlatform } from '@/platform';
import { sound } from '@/utils/sound';

export type GlassTabId = 'home' | 'notes' | 'canvas' | 'assistant' | 'study';

interface FloatingGlassTabBarProps {
  activeTab: GlassTabId;
  onSelectTab: (tab: GlassTabId) => void;
  onQuickCreate?: () => void;
  isVisible?: boolean;
  className?: string;
}

export const FloatingGlassTabBar: React.FC<FloatingGlassTabBarProps> = ({
  activeTab,
  onSelectTab,
  onQuickCreate,
  isVisible = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs: Array<{ id: GlassTabId; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-[20px] h-[20px]" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-[20px] h-[20px]" /> },
    { id: 'canvas', label: 'Canvas', icon: <PenTool className="w-[20px] h-[20px]" /> },
    { id: 'assistant', label: 'Assistant', icon: <Sparkles className="w-[20px] h-[20px]" /> },
    { id: 'study', label: 'Study', icon: <Flame className="w-[20px] h-[20px]" /> },
  ];

  const handleTabClick = (tabId: GlassTabId) => {
    sound.click();
    hapticsPlatform.impact('light').catch(() => {});
    onSelectTab(tabId);
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.click();
    hapticsPlatform.impact('medium').catch(() => {});
    if (onQuickCreate) {
      onQuickCreate();
    }
  };

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex items-center justify-center px-4 pb-[max(env(safe-area-inset-bottom,16px),16px)] transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5 max-w-md w-full justify-center">
        {/* Main Floating Glass Tab Bar Pill */}
        <nav
          ref={containerRef}
          aria-label="Main Navigation"
          className="liquid-glass-control pointer-events-auto flex items-center rounded-full p-1.5 shadow-2xl relative select-none flex-1 max-w-[340px]"
        >
          {/* Animated Glass Lens Highlight that slides behind active tab */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-full liquid-lens-active transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
            style={{
              width: `calc((100% - 12px) / 5)`,
              left: `calc(6px + ${activeIndex} * ((100% - 12px) / 5))`,
            }}
          />

          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                aria-label={`${tab.label} tab`}
                aria-selected={isActive}
                role="tab"
                className={`relative z-10 flex-1 flex flex-col items-center justify-center py-1.5 min-h-[46px] rounded-full spring-interactive transition-colors ${
                  isActive
                    ? 'text-[#007aff] dark:text-[#0a84ff] font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.id === 'assistant' && (
                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Separate Round Glass Quick-Create "+" Button */}
        <button
          onClick={handleCreateClick}
          aria-label="Quick create note or drawing"
          title="Quick Create Note"
          className="liquid-glass-control pointer-events-auto w-[52px] h-[52px] rounded-full flex items-center justify-center text-white bg-[#007aff] dark:bg-[#0a84ff] shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 spring-interactive active:scale-90 shrink-0 cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
