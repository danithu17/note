import React, { useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAuthStore } from '@/core/auth/useAuthStore';

// Lazily load heavy modals to keep the initial bundle light
const SyncModal = React.lazy(() =>
  import('./SyncModal').then((m) => ({ default: m.SyncModal }))
);
const AuthModal = React.lazy(() =>
  import('../auth/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const VersionHistoryModal = React.lazy(() =>
  import('../history/VersionHistoryModal').then((m) => ({ default: m.VersionHistoryModal }))
);
const PdfImportModal = React.lazy(() =>
  import('@/features/pdf/components/PdfImportModal').then((m) => ({ default: m.PdfImportModal }))
);
const AIStudyAssistantModal = React.lazy(() =>
  import('@/features/ai/components/AIStudyAssistantModal').then((m) => ({
    default: m.AIStudyAssistantModal,
  }))
);
const FlashcardsModal = React.lazy(() =>
  import('@/features/flashcards/components/FlashcardsModal').then((m) => ({
    default: m.FlashcardsModal,
  }))
);
const StudyDashboardModal = React.lazy(() =>
  import('@/features/focus/components/StudyDashboardModal').then((m) => ({
    default: m.StudyDashboardModal,
  }))
);
const PricingModal = React.lazy(() =>
  import('@/features/pricing/components/PricingModal').then((m) => ({
    default: m.PricingModal,
  }))
);
const TrashModal = React.lazy(() =>
  import('../trash/TrashModal').then((m) => ({
    default: m.TrashModal,
  }))
);
const AdminDashboardModal = React.lazy(() =>
  import('@/features/admin/components/AdminDashboardModal').then((m) => ({
    default: m.AdminDashboardModal,
  }))
);
const AccountSecurityModal = React.lazy(() =>
  import('../auth/AccountSecurityModal').then((m) => ({
    default: m.AccountSecurityModal,
  }))
);

export const GlobalModals: React.FC = () => {
  const { activeModal, closeModal } = useCanvasStore();
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) closeModal();
        if (isAuthModalOpen) closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, isAuthModalOpen, closeModal, closeAuthModal]);

  const handleCloseAuth = () => {
    closeAuthModal();
    if (activeModal === 'auth') closeModal();
  };

  return (
    <React.Suspense fallback={null}>
      <SyncModal
        isOpen={activeModal === 'sync'}
        onClose={closeModal}
      />
      <AuthModal
        isOpen={isAuthModalOpen || activeModal === 'auth'}
        onClose={handleCloseAuth}
      />
      <VersionHistoryModal
        isOpen={activeModal === 'history'}
        onClose={closeModal}
      />
      <PdfImportModal
        isOpen={activeModal === 'pdf'}
        onClose={closeModal}
      />
      <AIStudyAssistantModal
        isOpen={activeModal === 'ai'}
        onClose={closeModal}
      />
      <FlashcardsModal
        isOpen={activeModal === 'flashcards'}
        onClose={closeModal}
      />
      <StudyDashboardModal
        isOpen={activeModal === 'pomodoro'}
        onClose={closeModal}
      />
      <PricingModal
        isOpen={activeModal === 'pricing'}
        onClose={closeModal}
      />
      <TrashModal
        isOpen={activeModal === 'trash'}
        onClose={closeModal}
      />
      <AdminDashboardModal
        isOpen={activeModal === 'admin'}
        onClose={closeModal}
      />
      <AccountSecurityModal />
    </React.Suspense>
  );
};
