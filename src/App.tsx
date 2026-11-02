import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { LectureEditor } from './components/editor/LectureEditor';
import { VisualCanvas } from './components/canvas/VisualCanvas';
import { SplitPane } from './components/ui/SplitPane';
import { CommandPalette } from './components/ui/CommandPalette';
import { ShortcutsModal } from './components/ui/ShortcutsModal';
import { ReloadPrompt } from './components/ui/ReloadPrompt';
import { ChatTimelineView } from './features/notes/components/ChatTimelineView';
import { ChatAssistantPanel } from './features/assistant/components/ChatAssistantPanel';
import { LandingPage } from './features/landing/components/LandingPage';
import { GlobalModals } from './components/layout/GlobalModals';
import { TrialBanner } from './features/billing/components/TrialBanner';
import { WelcomeAuthScreen } from './components/auth/WelcomeAuthScreen';
import { OnboardingScreen } from './components/auth/OnboardingScreen';
import { GlassShowcaseView } from './features/glass/components/GlassShowcaseView';
import { useGlassStore } from './features/glass/useGlassStore';
import { useEntitlementsStore } from './features/billing/useEntitlementsStore';
import { paymentService, type PaymentProvider } from './features/billing/paymentService';
import { DEFAULT_PLANS } from './features/billing/entitlements';
import type { PlanId } from './features/billing/types';
import { useNoteStore } from './store/useNoteStore';
import { useCanvasStore } from './store/useCanvasStore';
import { useAuthStore } from './core/auth/useAuthStore';
import { useAndroidIntegration } from './platform/android/useAndroidIntegration';
import { platform } from './platform';
import { Capacitor } from '@capacitor/core';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentSuccessToast {
  open: boolean;
  planName: string;
  provider: string;
  orderId: string;
}

export function App() {
  // Native Android deep integration: back gestures, theme status bar sync, exit confirmation
  useAndroidIntegration();

  const { initialize, isLoading: isNotesLoading } = useNoteStore();
  const { isDarkMode, layoutMode, viewMode, setViewMode, openModal } = useCanvasStore();
  const { user, isLoading: isAuthLoading, isOnboarding } = useAuthStore();
  const [paymentToast, setPaymentToast] = useState<PaymentSuccessToast | null>(null);

  // Automatic Payment Verification & Instant Subscription Activation Listener
  useEffect(() => {
    const processPaymentReturn = async () => {
      const fullUrl = window.location.href;
      if (!fullUrl.includes('payment=success')) return;

      try {
        const queryIdx = fullUrl.indexOf('?');
        if (queryIdx === -1) return;

        const searchParams = new URLSearchParams(fullUrl.substring(queryIdx));
        const orderId = searchParams.get('order_id') || searchParams.get('order');
        const planId = (searchParams.get('plan_id') as PlanId) || 'pro';
        const provider = (searchParams.get('provider') as PaymentProvider) || 'payhere';
        const cycle = (searchParams.get('cycle') as 'monthly' | 'annual') || 'annual';
        const amount = parseFloat(searchParams.get('amount') || '0');
        const currency =
          (searchParams.get('currency') as 'USD' | 'LKR') ||
          (provider === 'payhere' ? 'LKR' : 'USD');

        if (orderId) {
          const res = await paymentService.verifyAndActivatePayment({
            orderId,
            planId,
            provider,
            cycle,
            amount,
            currency,
          });

          if (res.success) {
            confetti({
              particleCount: 80,
              spread: 75,
              origin: { y: 0.35 },
            });
            const pName = DEFAULT_PLANS[planId]?.name || 'Pro Scholar';
            setPaymentToast({
              open: true,
              planName: pName,
              provider: provider.toUpperCase(),
              orderId,
            });

            // Clean query parameters from URL without page reload
            const clean = window.location.href.split('?')[0];
            window.history.replaceState({}, document.title, clean);
          }
        }
      } catch (err) {
        console.warn('[App] Automated payment activation error:', err);
      }
    };

    processPaymentReturn();
    window.addEventListener('hashchange', processPaymentReturn);
    return () => window.removeEventListener('hashchange', processPaymentReturn);
  }, []);

  useEffect(() => {
    initialize();
    useAuthStore.getState().initialize();
    useEntitlementsStore.getState().initialize();
    useGlassStore.getState().initialize();

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('glass-preview')) {
        useCanvasStore.setState({ viewMode: 'glass-preview' });
        return;
      }
      if (hash.includes('access_token')) {
        // Authenticating via OAuth callback - route straight into app workspace
        useCanvasStore.setState({ viewMode: 'app' });
        return;
      }
      if (hash.includes('admin')) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.email?.toLowerCase() === 'nimjayad@gmail.com') {
          useCanvasStore.setState({ activeModal: 'admin', viewMode: 'app' });
        } else {
          useCanvasStore.setState({ viewMode: 'app' });
        }
      } else if (hash.includes('landing')) {
        useCanvasStore.setState({ viewMode: 'landing' });
      } else if (hash.includes('app')) {
        useCanvasStore.setState({ viewMode: 'app' });
      } else {
        // Default on launch:
        // If user is already signed in or on native Android platform, go directly to their workspace;
        // If not signed in on web, show welcoming Home Screen showcase
        const currentUser = useAuthStore.getState().user;
        if (currentUser || Capacitor.isNativePlatform()) {
          useCanvasStore.setState({ viewMode: 'app' });
        } else {
          useCanvasStore.setState({ viewMode: 'landing' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Sovereign God Mode keyboard shortcut: Ctrl+Shift+A / Cmd+Shift+A (Strictly restricted to nimjayad@gmail.com)
    const handleAdminKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.email?.toLowerCase() === 'nimjayad@gmail.com') {
          e.preventDefault();
          openModal('admin');
        }
      }
    };
    window.addEventListener('keydown', handleAdminKey);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleAdminKey);
    };
  }, [initialize, openModal]);

  // When user successfully authenticates, smoothly transition from landing into the app
  useEffect(() => {
    if (user && viewMode === 'landing') {
      const hash = window.location.hash.toLowerCase();
      if (!hash.includes('landing')) {
        setViewMode('app');
      }
    }
  }, [user, viewMode, setViewMode]);

  // Hide native Android splash screen instantly as soon as initialization is complete
  useEffect(() => {
    if (!isAuthLoading && !isNotesLoading) {
      platform.app.hideSplashScreen?.();
    }
  }, [isAuthLoading, isNotesLoading]);

  // Apple-Grade Splash / Initialization Spinner
  if (isAuthLoading || isNotesLoading) {
    return (
      <div className={`w-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-black text-slate-700 dark:text-slate-300 gap-4 font-sans ${isDarkMode ? 'dark' : ''}`}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 animate-pulse">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Initializing ScribbleNote...
          </span>
        </div>
      </div>
    );
  }

  // 1. Landing Page Showcase: First screen shown to visitors
  if (viewMode === 'landing') {
    return (
      <div
        className={`w-screen h-screen flex flex-col overflow-hidden bg-[#f8f9fa] dark:bg-black ${
          isDarkMode ? 'dark' : ''
        }`}
      >
        <div className="w-full h-full overflow-y-auto">
          <LandingPage
            onLaunchApp={() => setViewMode('app')}
            onOpenPricing={() => openModal('pricing')}
          />
        </div>
        <GlobalModals />
      </div>
    );
  }

  // 1.5 iOS 27 Liquid Glass Design System Showcase / Storybook Preview
  if (viewMode === 'glass-preview') {
    return <GlassShowcaseView />;
  }

  // 2. MANDATORY AUTH GUARD: When entering app, if unauthenticated, show Apple-grade Welcome/Auth screen!
  if (!user) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <WelcomeAuthScreen onBackToLanding={() => setViewMode('landing')} />
      </div>
    );
  }

  // 3. ONBOARDING STEP: Name, Academic Role, and Subject immediately after first signup
  if (isOnboarding) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <OnboardingScreen />
      </div>
    );
  }

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden bg-[#f2f2f7] dark:bg-black ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* Top Apple Navigation Bar */}
      <Header />

      {/* 14-Day Free Student Trial Status Banner */}
      <TrialBanner />

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden relative pb-16 md:pb-0">
        {/* Apple Notes Style 3-Column Sidebar Drawer */}
        <Sidebar />

        {/* Dynamic Workspace Layout: Chat Timeline Feed OR Resizable Hybrid Split Workspace */}
        {layoutMode === 'timeline' ? (
          <ChatTimelineView />
        ) : (
          <SplitPane left={<LectureEditor />} right={<VisualCanvas />} />
        )}

        {/* Apple iMessage-Style AI Study Assistant (Cmd/Ctrl+J) */}
        <ChatAssistantPanel />
      </div>

      {/* Mobile Bottom Navigation Tab Bar (Notes, Canvas, Assistant, Study) */}
      <MobileTabBar />

      {/* Global Modals (Auth, Sync, History, PDF, AI, Flashcards, Pomodoro, Pricing, Trash, Account) */}
      <GlobalModals />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Keyboard Shortcuts Cheatsheet (?) */}
      <ShortcutsModal />

      {/* PWA Service Worker Offline & Update Prompt */}
      <ReloadPrompt />

      {/* Automated Payment Verification Success Notification */}
      {paymentToast?.open && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-2xl bg-emerald-600/95 dark:bg-emerald-600/90 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 border border-emerald-400/30">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold leading-tight">
                Subscription Activated Automatically!
              </div>
              <div className="text-[11px] text-emerald-100 truncate mt-0.5">
                {paymentToast.planName} via {paymentToast.provider} ({paymentToast.orderId})
              </div>
            </div>
            <button
              onClick={() => setPaymentToast(null)}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
