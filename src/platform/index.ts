/**
 * ScribbleNote Unified Platform Abstraction Layer
 * Provides clean multi-target APIs across Web PWA, Android (Capacitor), and PC Desktop (Electron).
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
}

export class PlatformService {
  private static instance: PlatformService;

  private constructor() {}

  public static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  /**
   * Feature-detect running platform target
   */
  public get target(): PlatformTarget {
    // 1. Check Electron window bridge
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return 'electron';
    }

    // 2. Check Capacitor Android
    if (
      typeof window !== 'undefined' &&
      (window as any).Capacitor &&
      (window as any).Capacitor.isNativePlatform()
    ) {
      return 'android';
    }

    // 3. Fallback to Web PWA
    return 'web';
  }

  public get capabilities(): PlatformCapabilities {
    const t = this.target;
    return {
      target: t,
      isNativeApp: t !== 'web',
      hasHaptics: t === 'android' || (typeof navigator !== 'undefined' && 'vibrate' in navigator),
      hasNativeShare: typeof navigator !== 'undefined' && 'share' in navigator,
      hasNativeFileSystem: t === 'electron' || (typeof window !== 'undefined' && 'showOpenFilePicker' in window),
    };
  }

  /**
   * Native Haptic Feedback (vibrate device on stroke or button tap)
   */
  public triggerHaptics(style: 'light' | 'medium' | 'heavy' = 'light'): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const ms = style === 'light' ? 10 : style === 'medium' ? 25 : 45;
        navigator.vibrate(ms);
      }
    } catch {
      // Gracefully ignore on unsupported devices
    }
  }

  /**
   * Cross-platform Note Share Sheet
   */
  public async shareNote(title: string, text: string, url?: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: url || window.location.href });
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    // Fallback: Copy link/text to clipboard
    try {
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cross-platform Notification (Study reminders & Pomodoro chime)
   */
  public async notify(title: string, body: string): Promise<void> {
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/pwa-192x192.png' });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body, icon: '/pwa-192x192.png' });
        }
      }
    }
  }

  /**
   * Cross-platform File Exporter
   */
  public async saveFile(
    filename: string,
    content: string | Blob,
    mimeType: string
  ): Promise<void> {
    // If Electron provides native file dialog:
    if (this.target === 'electron' && (window as any).electronAPI?.saveFile) {
      await (window as any).electronAPI.saveFile({ filename, content, mimeType });
      return;
    }

    // Web / Capacitor Blob Anchor Download
    const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  /**
   * Online connectivity state
   */
  public get isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

export const platform = PlatformService.getInstance();
