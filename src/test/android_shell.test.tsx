import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { QuickCreateSheet } from '@/features/home/components/QuickCreateSheet';
import { HomeDashboardView } from '@/features/home/components/HomeDashboardView';

describe('Android Shell & Adaptive Navigation', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      mainTab: 'home',
      isTabBarVisible: true,
      isQuickCreateOpen: false,
      layoutMode: 'split',
    });
  });

  it('initializes with mainTab as home and tab bar visible', () => {
    const state = useCanvasStore.getState();
    expect(state.mainTab).toBe('home');
    expect(state.isTabBarVisible).toBe(true);
    expect(state.isQuickCreateOpen).toBe(false);
  });

  it('updates mainTab and switches views cleanly', () => {
    const { setMainTab } = useCanvasStore.getState();

    setMainTab('notes');
    expect(useCanvasStore.getState().mainTab).toBe('notes');

    setMainTab('canvas');
    expect(useCanvasStore.getState().mainTab).toBe('canvas');

    setMainTab('home');
    expect(useCanvasStore.getState().mainTab).toBe('home');
  });

  it('toggles isTabBarVisible on scroll direction signals', () => {
    const { setTabBarVisible } = useCanvasStore.getState();

    setTabBarVisible(false);
    expect(useCanvasStore.getState().isTabBarVisible).toBe(false);

    setTabBarVisible(true);
    expect(useCanvasStore.getState().isTabBarVisible).toBe(true);
  });

  it('renders QuickCreateSheet with all 5 creation options and triggers note creation', async () => {
    let closed = false;

    render(
      <QuickCreateSheet
        isOpen={true}
        onClose={() => {
          closed = true;
        }}
      />
    );

    expect(screen.getByText('New Lecture Note')).toBeInTheDocument();
    expect(screen.getByText('New Canvas Drawing')).toBeInTheDocument();
    expect(screen.getByText('Record Lecture')).toBeInTheDocument();
    expect(screen.getByText('Import PDF Slides')).toBeInTheDocument();
    expect(screen.getByText('Scan / Photo to Note')).toBeInTheDocument();

    const newNoteBtn = screen.getByText('New Lecture Note');
    fireEvent.click(newNoteBtn);

    await waitFor(() => {
      expect(closed).toBe(true);
      expect(useCanvasStore.getState().mainTab).toBe('notes');
    });
  });

  it('renders HomeDashboardView with large title greeting, real data and search pill', () => {
    useAuthStore.setState({
      user: {
        id: 'usr_test',
        name: 'Nimjaya',
        email: 'nimjaya@test.com',
        isGuest: false,
        plan: 'pro',
        trialStart: Date.now(),
        trialEnd: Date.now() + 14 * 24 * 3600 * 1000,
        storageUsedBytes: 0,
        storageLimitBytes: 10 * 1024 * 1024 * 1024,
      },
    });

    render(<HomeDashboardView />);

    expect(screen.getByText(/Nimjaya/)).toBeInTheDocument();
    expect(screen.getByText('Search notes, handwriting, PDFs...')).toBeInTheDocument();
    expect(screen.getByText('Today\'s Focus')).toBeInTheDocument();
    expect(screen.getByText('5 Days')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });
});
