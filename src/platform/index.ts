/**
 * ScribbleNote Unified Platform Abstraction Layer
 * Feature-detects runtime environment (Android Capacitor vs Web PWA vs Desktop Electron)
 * and exports decoupled, type-safe platform services.
 */

import { Capacitor } from '@capacitor/core';
import type {
  PlatformTarget,
  PlatformCapabilities,
  IStoragePlatform,
  ISharePlatform,
  IHapticsPlatform,
  INetworkPlatform,
  INotificationsPlatform,
  IAudioRecorderPlatform,
  IAuthPlatform,
  IBillingPlatform,
  IAppPlatform,
} from './types';

import {
  WebStoragePlatform,
  WebSharePlatform,
  WebHapticsPlatform,
  WebNetworkPlatform,
  WebNotificationsPlatform,
  WebAudioRecorderPlatform,
  WebAuthPlatform,
  WebBillingPlatform,
  WebAppPlatform,
} from './web';

import {
  AndroidStoragePlatform,
  AndroidSharePlatform,
  AndroidHapticsPlatform,
  AndroidNetworkPlatform,
  AndroidNotificationsPlatform,
  AndroidAudioRecorderPlatform,
  AndroidAuthPlatform,
  AndroidBillingPlatform,
  AndroidAppPlatform,
} from './android';

export * from './types';

function detectTarget(): PlatformTarget {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return 'electron';
  }
  if (Capacitor.isNativePlatform() || Capacitor.getPlatform() === 'android') {
    return 'android';
  }
  return 'web';
}

const currentTarget = detectTarget();
const isAndroid = currentTarget === 'android';

// Singleton service instances
export const storagePlatform: IStoragePlatform = isAndroid
  ? new AndroidStoragePlatform()
  : new WebStoragePlatform();

export const sharePlatform: ISharePlatform = isAndroid
  ? new AndroidSharePlatform()
  : new WebSharePlatform();

export const hapticsPlatform: IHapticsPlatform = isAndroid
  ? new AndroidHapticsPlatform()
  : new WebHapticsPlatform();

export const networkPlatform: INetworkPlatform = isAndroid
  ? new AndroidNetworkPlatform()
  : new WebNetworkPlatform();

export const notificationsPlatform: INotificationsPlatform = isAndroid
  ? new AndroidNotificationsPlatform()
  : new WebNotificationsPlatform();

export const audioPlatform: IAudioRecorderPlatform = isAndroid
  ? new AndroidAudioRecorderPlatform()
  : new WebAudioRecorderPlatform();

export const authPlatform: IAuthPlatform = isAndroid
  ? new AndroidAuthPlatform()
  : new WebAuthPlatform();

export const billingPlatform: IBillingPlatform = isAndroid
  ? new AndroidBillingPlatform()
  : new WebBillingPlatform();

export const appPlatform: IAppPlatform = isAndroid
  ? new AndroidAppPlatform()
  : new WebAppPlatform();

/**
 * Backward compatibility facade preserving existing PlatformService methods
 */
export class PlatformService {
  private static instance: PlatformService;

  private constructor() {}

  public static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  public get target(): PlatformTarget {
    return detectTarget();
  }

  public get capabilities(): PlatformCapabilities {
    const t = this.target;
    return {
      target: t,
      isNativeApp: t !== 'web',
      hasHaptics: true,
      hasNativeShare: true,
      hasNativeFileSystem: true,
      hasNativeBilling: t === 'android',
      hasNativeAudioRecording: true,
      hasNativeNotifications: true,
    };
  }

  public triggerHaptics(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    hapticsPlatform.impact(style);
  }

  public async shareNote(title: string, text: string, url?: string): Promise<boolean> {
    return sharePlatform.share({ title, text, url });
  }

  public async notify(title: string, body: string): Promise<void> {
    return notificationsPlatform.schedule({
      id: Math.floor(Math.random() * 100000),
      title,
      body,
    });
  }

  public async saveFile(filename: string, content: string | Blob, mimeType: string): Promise<void> {
    return storagePlatform.saveFile(filename, content, mimeType);
  }

  public get isOnline(): boolean {
    return networkPlatform.isOnline();
  }

  public get app(): IAppPlatform {
    return appPlatform;
  }

  public get billing(): IBillingPlatform {
    return billingPlatform;
  }

  public get storage(): IStoragePlatform {
    return storagePlatform;
  }

  public get share(): ISharePlatform {
    return sharePlatform;
  }

  public get haptics(): IHapticsPlatform {
    return hapticsPlatform;
  }

  public get network(): INetworkPlatform {
    return networkPlatform;
  }

  public get notifications(): INotificationsPlatform {
    return notificationsPlatform;
  }

  public get audio(): IAudioRecorderPlatform {
    return audioPlatform;
  }

  public get auth(): IAuthPlatform {
    return authPlatform;
  }
}

export const platform = PlatformService.getInstance();
