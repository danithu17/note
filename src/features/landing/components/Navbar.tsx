import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import {
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLaunchApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onLaunchApp,
}) => {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Platforms', href: '#platforms' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#fbfbfd]/85 dark:bg-[#000000]/85 backdrop-blur-2xl shadow-xs border-b border-black/[0.08] dark:border-white/10'
            : 'bg-[#fbfbfd]/70 dark:bg-[#000000]/70 backdrop-blur-xl border-b border-transparent'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3.5 group focus-visible:rounded-2xl"
            aria-label="ScribbleNote Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0071e3] via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[19px] tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                ScribbleNote
              </span>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[14px] font-semibold bg-blue-500/10 dark:bg-blue-500/20 text-[#0071e3] dark:text-blue-400 border border-blue-500/20">
                Pro
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav
            className="hidden md:flex items-center gap-9 text-[15px] font-medium text-[#1d1d1f]/75 dark:text-[#f5f5f7]/75"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors focus-visible:rounded-lg focus-visible:px-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[#1d1d1f]/80 dark:text-[#f5f5f7]/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Desktop Log In Button */}
            <button
              onClick={onLaunchApp}
              className="hidden md:inline-flex items-center justify-center h-12 px-4 rounded-full text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:text-[#0071e3] dark:hover:text-[#2997ff] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              {user ? 'My Notes' : 'Log in'}
            </button>

            {/* Start Free CTA (hidden on extra small screens, prominently accessible via hamburger menu) */}
            <button
              onClick={onLaunchApp}
              className="inline-flex min-h-[48px] h-12 px-4 sm:px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[14px] sm:text-[15px] font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <span>{user ? 'Open Notes' : 'Start free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-x-0 top-20 bg-[#fbfbfd] dark:bg-[#121214] border-b border-black/[0.08] dark:border-white/10 shadow-2xl p-6 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-3" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-4 rounded-2xl text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-black/[0.08] dark:border-white/10 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchApp();
                }}
                className="w-full h-12 rounded-full border border-black/15 dark:border-white/20 text-[#1d1d1f] dark:text-[#f5f5f7] text-[16px] font-semibold flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {user ? 'My Notes' : 'Log in'} to Account
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchApp();
                }}
                className="w-full h-12 rounded-full bg-[#0071e3] text-white text-[16px] font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-95 transition-all"
              >
                <span>Start free trial (14 Days)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
