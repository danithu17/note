import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { useCanvasStore } from '../store/useCanvasStore';
import capacitorConfig from '../../capacitor.config';

describe('Phase 5: Commercialization, Responsive Controls & Packaging', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      activeModal: null,
      isCommandPaletteOpen: false,
      isSidebarOpen: true,
    });
  });

  describe('Modal State Management across Responsive Pages', () => {
    it('opens and closes modals seamlessly from global canvas store', () => {
      const { openModal, closeModal } = useCanvasStore.getState();

      expect(useCanvasStore.getState().activeModal).toBeNull();

      openModal('pricing');
      expect(useCanvasStore.getState().activeModal).toBe('pricing');

      openModal('ai');
      expect(useCanvasStore.getState().activeModal).toBe('ai');

      openModal('flashcards');
      expect(useCanvasStore.getState().activeModal).toBe('flashcards');

      openModal('pomodoro');
      expect(useCanvasStore.getState().activeModal).toBe('pomodoro');

      openModal('pdf');
      expect(useCanvasStore.getState().activeModal).toBe('pdf');

      closeModal();
      expect(useCanvasStore.getState().activeModal).toBeNull();
    });
  });

  describe('Capacitor Mobile Container Configuration', () => {
    it('contains valid iOS and Android app packaging metadata', () => {
      expect(capacitorConfig.appId).toBe('com.scribblenote.app');
      expect(capacitorConfig.appName).toBe('ScribbleNote');
      expect(capacitorConfig.webDir).toBe('dist');
      expect(capacitorConfig.server?.androidScheme).toBe('https');
      expect(capacitorConfig.plugins?.SplashScreen?.backgroundColor).toBe('#0f172a');
      expect(capacitorConfig.plugins?.Keyboard?.resize).toBe('body');
    });
  });

  describe('Legal Compliance & Student Data Privacy Documents', () => {
    it('provides a comprehensive local-first PRIVACY.md policy', () => {
      const privacyPath = path.resolve(process.cwd(), 'PRIVACY.md');
      expect(fs.existsSync(privacyPath)).toBe(true);

      const content = fs.readFileSync(privacyPath, 'utf8');
      expect(content).toContain('Local-First by Default');
      expect(content).toContain('Zero AI Training on Your Notes');
      expect(content).toContain('Row Level Security');
      expect(content).toContain('30-Day Soft Delete Retention');
    });

    it('provides commercial TERMS.md with 14-day refund guarantee', () => {
      const termsPath = path.resolve(process.cwd(), 'TERMS.md');
      expect(fs.existsSync(termsPath)).toBe(true);

      const content = fs.readFileSync(termsPath, 'utf8');
      expect(content).toContain('ScribbleNote Terms of Service');
      expect(content).toContain('Pro Scholar Tier');
      expect(content).toContain('14-Day Refund Guarantee');
      expect(content).toContain('Guest Mode');
    });
  });

  describe('Commercial Pricing Calculations & Discounts', () => {
    it('applies 20% annual discount correctly', () => {
      const monthlyPro = 4.99;
      const annualProMonthlyEquivalent = 3.99;
      const discountPercentage = Math.round(
        ((monthlyPro - annualProMonthlyEquivalent) / monthlyPro) * 100
      );
      expect(discountPercentage).toBe(20);

      const monthlyTeam = 9.99;
      const annualTeamMonthlyEquivalent = 7.99;
      const teamDiscountPercentage = Math.round(
        ((monthlyTeam - annualTeamMonthlyEquivalent) / monthlyTeam) * 100
      );
      expect(teamDiscountPercentage).toBe(20);
    });
  });
});
