import type {
  IStoragePlatform,
  ISharePlatform,
  IHapticsPlatform,
  INetworkPlatform,
  INotificationsPlatform,
  IAudioRecorderPlatform,
  IAuthPlatform,
  IBillingPlatform,
  IAppPlatform,
  IBillingProduct,
} from '../types';

export class WebStoragePlatform implements IStoragePlatform {
  async saveFile(filename: string, content: string | Blob, mimeType: string): Promise<void> {
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

  async readFile(filter?: { accept: string; extensions?: string[] }): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (filter?.accept) input.accept = filter.accept;
      input.onchange = () => {
        if (input.files && input.files[0]) {
          resolve(input.files[0]);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }

  async exportNoteBundle(title: string, data: any): Promise<void> {
    const jsonStr = JSON.stringify(data, null, 2);
    await this.saveFile(`${title.toLowerCase().replace(/\s+/g, '_')}_bundle.json`, jsonStr, 'application/json');
  }
}

export class WebSharePlatform implements ISharePlatform {
  canShare(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  async share(options: { title: string; text?: string; url?: string; dialogTitle?: string }): Promise<boolean> {
    if (this.canShare()) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url || window.location.href,
        });
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') return false;
      }
    }

    // Fallback to clipboard
    try {
      const payload = `${options.title}\n\n${options.text || ''}\n${options.url || window.location.href}`.trim();
      await navigator.clipboard.writeText(payload);
      return true;
    } catch {
      return false;
    }
  }
}

export class WebHapticsPlatform implements IHapticsPlatform {
  async impact(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const ms = style === 'light' ? 12 : style === 'medium' ? 25 : 50;
        navigator.vibrate(ms);
      }
    } catch {
      // Ignored
    }
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const pattern = type === 'success' ? [15, 30, 20] : type === 'warning' ? [30, 40, 30] : [50, 50, 50];
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignored
    }
  }

  async selection(): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {
      // Ignored
    }
  }
}

export class WebNetworkPlatform implements INetworkPlatform {
  async getStatus(): Promise<{ connected: boolean; connectionType: string }> {
    const connected = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const connectionType = (navigator as any)?.connection?.effectiveType || 'unknown';
    return { connected, connectionType };
  }

  addListener(callback: (status: { connected: boolean; connectionType: string }) => void): () => void {
    const handleOnline = () => callback({ connected: true, connectionType: 'online' });
    const handleOffline = () => callback({ connected: false, connectionType: 'none' });

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

export class WebNotificationsPlatform implements INotificationsPlatform {
  async schedule(options: { id: number; title: string; body: string; scheduleAt?: Date }): Promise<void> {
    if (typeof Notification === 'undefined') return;

    const delay = options.scheduleAt ? Math.max(0, options.scheduleAt.getTime() - Date.now()) : 0;
    setTimeout(async () => {
      if (Notification.permission === 'granted') {
        new Notification(options.title, { body: options.body, icon: '/pwa-192x192.png' });
      }
    }, delay);
  }

  async requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false;
    const res = await Notification.requestPermission();
    return res === 'granted';
  }

  async hasPermission(): Promise<boolean> {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }
}

export class WebAudioRecorderPlatform implements IAudioRecorderPlatform {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;

  async hasPermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;
    return true;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.audioChunks = [];
      this.startTime = Date.now();
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      this.mediaRecorder.start(250);
      return true;
    } catch (err) {
      console.error('Failed to start web audio recording:', err);
      return false;
    }
  }

  async pauseRecording(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  async resumeRecording(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  async stopRecording(): Promise<{ blob?: Blob; durationSec: number } | null> {
    if (!this.mediaRecorder) return null;
    return new Promise((resolve) => {
      const durationSec = Math.round((Date.now() - this.startTime) / 1000);
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        this.mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
        this.mediaRecorder = null;
        resolve({ blob, durationSec });
      };
      this.mediaRecorder!.stop();
    });
  }
}

export class WebAuthPlatform implements IAuthPlatform {
  isNativeGoogleAvailable(): boolean {
    return false;
  }

  async signInWithGoogleNative(): Promise<{
    idToken: string;
    email?: string;
    name?: string;
    imageUrl?: string;
  } | null> {
    return null;
  }
}

export class WebBillingPlatform implements IBillingPlatform {
  isPlayBillingAvailable(): boolean {
    return false;
  }

  async getProducts(): Promise<IBillingProduct[]> {
    return [];
  }

  async purchase(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Web billing is handled via Stripe/PayHere portal.' };
  }

  async restorePurchases(): Promise<{ success: boolean; activeProductIds: string[] }> {
    return { success: true, activeProductIds: [] };
  }

  async openSubscriptionManagement(): Promise<void> {
    window.open('/#pricing', '_blank');
  }
}

export class WebAppPlatform implements IAppPlatform {
  exitApp(): void {
    window.close();
  }

  addBackButtonListener(): () => void {
    return () => {};
  }

  async setStatusBar(): Promise<void> {
    // Web meta theme-color can be updated if desired
  }

  async keepScreenOn(enabled: boolean): Promise<void> {
    if (enabled && 'wakeLock' in navigator) {
      try {
        await (navigator as any).wakeLock.request('screen');
      } catch {
        // Ignored
      }
    }
  }

  async hideSplashScreen(): Promise<void> {
    // No-op for web
  }
}
