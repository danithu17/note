import { useEffect, useRef } from 'react';
import { platform } from '@/platform';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAssistantStore } from '@/features/assistant/useAssistantStore';
import { useAuthStore } from '@/core/auth/useAuthStore';

/**
 * Android Native Experience Controller
 * Manages:
 * 1. Predictive / Hardware Back Button navigation & modal dismissal
 * 2. Status bar & system navigation bar color synchronization with theme
 * 3. Double-back to exit on root screen
 * 4. Safe area and screen keep-alive handling
 */
export function useAndroidIntegration() {
  const { isDarkMode, activeModal, closeModal, isCommandPaletteOpen, closeCommandPalette, isShortcutsModalOpen, closeShortcutsModal, isSidebarOpen, setSidebarOpen, layoutMode, setLayoutMode } = useCanvasStore();
  const { isOpen: isAssistantOpen, setAssistantOpen } = useAssistantStore();
  const { isAuthModalOpen, isAccountModalOpen } = useAuthStore();

  const lastBackPressTimeRef = useRef<number>(0);
  const backToastRef = useRef<HTMLDivElement | null>(null);

  // 1. Sync Native Status Bar with Light/Dark Theme
  useEffect(() => {
    platform.app.setStatusBar({
      style: isDarkMode ? 'DARK' : 'LIGHT',
      backgroundColor: isDarkMode ? '#000000' : '#f2f2f7',
    });
  }, [isDarkMode]);

  // 2. Android Back Button / Gesture Dispatcher
  useEffect(() => {
    const removeListener = platform.app.addBackButtonListener(() => {
      // Step A: Close active global modal
      if (activeModal) {
        closeModal();
        return true;
      }

      // Step B: Close auth or account modal
      if (isAuthModalOpen || isAccountModalOpen) {
        useAuthStore.setState({ isAuthModalOpen: false, isAccountModalOpen: false });
        return true;
      }

      // Step C: Close command palette
      if (isCommandPaletteOpen) {
        closeCommandPalette();
        return true;
      }

      // Step D: Close shortcuts modal
      if (isShortcutsModalOpen) {
        closeShortcutsModal();
        return true;
      }

      // Step E: Close AI assistant panel
      if (isAssistantOpen) {
        setAssistantOpen(false);
        return true;
      }

      // Step F: Close mobile sidebar drawer
      if (isSidebarOpen) {
        setSidebarOpen(false);
        return true;
      }

      // Step G: Return from canvas-only view to notes
      if (layoutMode === 'canvas-only') {
        setLayoutMode('notes-only');
        return true;
      }

      // Step G2: If user is on WelcomeAuthScreen or unauthenticated, return to Home Screen
      const currentUser = useAuthStore.getState().user;
      const currentViewMode = useCanvasStore.getState().viewMode;
      if (currentViewMode === 'app' && !currentUser) {
        useCanvasStore.setState({ viewMode: 'landing' });
        return true;
      }

      // Step H: Confirm Exit with double back tap within 2.5s
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2500) {
        if (backToastRef.current) {
          backToastRef.current.remove();
        }
        platform.app.exitApp();
        return true;
      }

      lastBackPressTimeRef.current = now;
      showExitConfirmationToast();
      return true;
    });

    return () => {
      removeListener();
    };
  }, [
    activeModal,
    closeModal,
    isAuthModalOpen,
    isAccountModalOpen,
    isCommandPaletteOpen,
    closeCommandPalette,
    isShortcutsModalOpen,
    closeShortcutsModal,
    isAssistantOpen,
    setAssistantOpen,
    isSidebarOpen,
    setSidebarOpen,
    layoutMode,
    setLayoutMode,
  ]);
}

function showExitConfirmationToast() {
  const existing = document.getElementById('android-back-exit-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'android-back-exit-toast';
  toast.innerText = 'Tap back again to exit ScribbleNote';
  toast.style.position = 'fixed';
  toast.style.bottom = '80px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(15, 23, 42, 0.92)';
  toast.style.color = '#ffffff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '9999px';
  toast.style.fontSize = '12px';
  toast.style.fontWeight = '600';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.4)';
  toast.style.pointerEvents = 'none';
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}
