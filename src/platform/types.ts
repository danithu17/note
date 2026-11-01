/**
 * ScribbleNote Platform Abstraction Layer - Core Type Definitions
 * Strict contracts separating UI from underlying Web and Native Capacitor platforms.
 */

export type PlatformTarget = 'web' | 'android' | 'electron';

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface PlatformCapabilities {
  target: PlatformTarget;
  isNativeApp: boolean;
  hasHaptics: boolean;
  hasNativeShare: boolean;
  hasNativeFileSystem: boolean;
  hasNativeBilling: boolean;
  hasNativeAudioRecording: boolean;
  hasNativeNotifications: boolean;
}

export interface IStoragePlatform {
  saveFile(filename: string, content: string | Blob, mimeType: string): Promise<void>;
  readFile(filter?: { accept: string; extensions?: string[] }): Promise<File | null>;
  exportNoteBundle(title: string, data: any): Promise<void>;
}

export interface ISharePlatform {
  canShare(): boolean;
  share(options: { title: string; text?: string; url?: string; dialogTitle?: string }): Promise<boolean>;
}

export interface IHapticsPlatform {
  impact(style?: 'light' | 'medium' | 'heavy'): Promise<void>;
  notification(type?: 'success' | 'warning' | 'error'): Promise<void>;
  selection(): Promise<void>;
}

export interface INetworkPlatform {
  getStatus(): Promise<{ connected: boolean; connectionType: string }>;
  addListener(callback: (status: { connected: boolean; connectionType: string }) => void): () => void;
  isOnline(): boolean;
}

export interface INotificationsPlatform {
  schedule(options: {
    id: number;
    title: string;
    body: string;
    scheduleAt?: Date;
    sound?: string;
  }): Promise<void>;
  requestPermission(): Promise<boolean>;
  hasPermission(): Promise<boolean>;
}

export interface IAudioRecorderPlatform {
  startRecording(): Promise<boolean>;
  pauseRecording(): Promise<void>;
  resumeRecording(): Promise<void>;
  stopRecording(): Promise<{ blob?: Blob; path?: string; durationSec: number } | null>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
}

export interface IAuthPlatform {
  isNativeGoogleAvailable(): boolean;
  signInWithGoogleNative(webClientId: string): Promise<{ idToken: string } | null>;
}

export interface IBillingProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  period?: 'monthly' | 'yearly';
}

export interface IBillingPlatform {
  isPlayBillingAvailable(): boolean;
  getProducts(): Promise<IBillingProduct[]>;
  purchase(productId: string): Promise<{ success: boolean; purchaseToken?: string; error?: string }>;
  restorePurchases(): Promise<{ success: boolean; activeProductIds: string[] }>;
  openSubscriptionManagement(): Promise<void>;
}

export interface IAppPlatform {
  exitApp(): void;
  addBackButtonListener(callback: () => boolean | void): () => void;
  setStatusBar(options: { style: 'DARK' | 'LIGHT'; backgroundColor?: string }): Promise<void>;
  keepScreenOn(enabled: boolean): Promise<void>;
}
