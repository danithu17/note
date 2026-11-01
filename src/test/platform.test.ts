import { describe, it, expect, vi } from 'vitest';
import {
  platform,
  storagePlatform,
  sharePlatform,
  hapticsPlatform,
  networkPlatform,
  notificationsPlatform,
  audioPlatform,
  authPlatform,
  billingPlatform,
  appPlatform,
} from '../platform';

describe('Platform Abstraction Layer', () => {
  it('detects runtime target and exposes capability flags', () => {
    expect(platform.target).toBeDefined();
    expect(['web', 'android', 'electron']).toContain(platform.target);

    const caps = platform.capabilities;
    expect(caps).toHaveProperty('target');
    expect(caps).toHaveProperty('isNativeApp');
    expect(caps).toHaveProperty('hasHaptics');
    expect(caps).toHaveProperty('hasNativeShare');
    expect(caps).toHaveProperty('hasNativeFileSystem');
  });

  it('provides safe haptics triggers that do not throw in test environments', async () => {
    expect(() => platform.triggerHaptics('light')).not.toThrow();
    expect(() => platform.triggerHaptics('heavy')).not.toThrow();
    await expect(hapticsPlatform.selection()).resolves.not.toThrow();
    await expect(hapticsPlatform.notification('success')).resolves.not.toThrow();
  });

  it('exposes network status queries and listeners', async () => {
    const status = await networkPlatform.getStatus();
    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('connectionType');
    expect(typeof platform.isOnline).toBe('boolean');

    const unsubscribe = networkPlatform.addListener(vi.fn());
    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });

  it('provides safe notification scheduling interface', async () => {
    await expect(
      notificationsPlatform.schedule({
        id: 1,
        title: 'Study Reminder',
        body: 'Time to review your physics notes!',
      })
    ).resolves.not.toThrow();
  });

  it('provides audio recorder platform contracts', async () => {
    expect(typeof audioPlatform.hasPermission).toBe('function');
    expect(typeof audioPlatform.startRecording).toBe('function');
    expect(typeof audioPlatform.stopRecording).toBe('function');
  });

  it('provides decoupled billing and auth platform adapters', async () => {
    expect(typeof authPlatform.isNativeGoogleAvailable).toBe('function');
    expect(typeof billingPlatform.isPlayBillingAvailable).toBe('function');
    expect(typeof storagePlatform.saveFile).toBe('function');
    expect(typeof sharePlatform.share).toBe('function');
    expect(typeof appPlatform.exitApp).toBe('function');
    const products = await billingPlatform.getProducts();
    expect(Array.isArray(products)).toBe(true);
  });
});
