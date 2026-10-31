import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { platform } from '../platform';

describe('Phase 6: Cross-Platform Abstraction & Desktop / Mobile Packaging', () => {
  describe('Unified Platform Abstraction Layer', () => {
    it('accurately identifies platform target and capabilities', () => {
      expect(['web', 'android', 'electron']).toContain(platform.target);
      const caps = platform.capabilities;
      expect(caps.target).toBe(platform.target);
      expect(typeof caps.isNativeApp).toBe('boolean');
      expect(typeof caps.hasHaptics).toBe('boolean');
      expect(typeof caps.hasNativeShare).toBe('boolean');
    });

    it('safely handles haptic triggering without throwing in node/web environment', () => {
      expect(() => {
        platform.triggerHaptics('light');
        platform.triggerHaptics('heavy');
      }).not.toThrow();
    });

    it('provides online connectivity status', () => {
      expect(typeof platform.isOnline).toBe('boolean');
    });
  });

  describe('Electron PC Desktop Build Configuration', () => {
    it('verifies electron main process and preload script existence', () => {
      const mainPath = path.resolve(process.cwd(), 'electron', 'main.cjs');
      const preloadPath = path.resolve(process.cwd(), 'electron', 'preload.cjs');

      expect(fs.existsSync(mainPath)).toBe(true);
      expect(fs.existsSync(preloadPath)).toBe(true);

      const mainContent = fs.readFileSync(mainPath, 'utf8');
      expect(mainContent).toContain('BrowserWindow');
      expect(mainContent).toContain('dialog:saveFile');
      expect(mainContent).toContain('platform:getInfo');

      const preloadContent = fs.readFileSync(preloadPath, 'utf8');
      expect(preloadContent).toContain('contextBridge.exposeInMainWorld');
      expect(preloadContent).toContain('electronAPI');
    });
  });

  describe('Capacitor Android Packaging Configuration', () => {
    it('verifies capacitor.config.ts configuration attributes', () => {
      const capPath = path.resolve(process.cwd(), 'capacitor.config.ts');
      expect(fs.existsSync(capPath)).toBe(true);

      const capContent = fs.readFileSync(capPath, 'utf8');
      expect(capContent).toContain('com.scribblenote.app');
      expect(capContent).toContain('ScribbleNote');
      expect(capContent).toContain('androidScheme');
    });
  });
});
