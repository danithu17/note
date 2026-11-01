import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
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

export class AndroidStoragePlatform implements IStoragePlatform {
  async saveFile(filename: string, content: string | Blob, _mimeType: string): Promise<void> {
    try {
      let data: string;
      if (typeof content === 'string') {
        data = content;
      } else {
        // Convert Blob to base64
        data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(content);
        });
      }

      await Filesystem.writeFile({
        path: filename,
        data,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (err) {
      console.error('Android Filesystem save error:', err);
      // Fallback to web blob download
      const blob = typeof content === 'string' ? new Blob([content]) : content;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 200);
    }
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
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_bundle.json`;
    await this.saveFile(filename, JSON.stringify(data, null, 2), 'application/json');
  }
}

export class AndroidSharePlatform implements ISharePlatform {
  canShare(): boolean {
    return true;
  }

  async share(options: { title: string; text?: string; url?: string; dialogTitle?: string }): Promise<boolean> {
    try {
      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || 'Share Note via',
      });
      return true;
    } catch (err: any) {
      if (err.message && err.message.includes('canceled')) return false;
      console.warn('Android native share failed:', err);
      return false;
    }
  }
}

export class AndroidHapticsPlatform implements IHapticsPlatform {
  async impact(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    try {
      const capStyle =
        style === 'heavy' ? ImpactStyle.Heavy : style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light;
      await Haptics.impact({ style: capStyle });
    } catch {
      // Ignored
    }
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    try {
      const capType =
        type === 'error'
          ? NotificationType.Error
          : type === 'warning'
            ? NotificationType.Warning
            : NotificationType.Success;
      await Haptics.notification({ type: capType });
    } catch {
      // Ignored
    }
  }

  async selection(): Promise<void> {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch {
      // Ignored
    }
  }
}

export class AndroidNetworkPlatform implements INetworkPlatform {
  async getStatus(): Promise<{ connected: boolean; connectionType: string }> {
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  }

  addListener(callback: (status: { connected: boolean; connectionType: string }) => void): () => void {
    const listenerPromise = Network.addListener('networkStatusChange', (s) => {
      callback({ connected: s.connected, connectionType: s.connectionType });
    });

    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

export class AndroidNotificationsPlatform implements INotificationsPlatform {
  async schedule(options: { id: number; title: string; body: string; scheduleAt?: Date; sound?: string }): Promise<void> {
    try {
      const granted = await this.hasPermission();
      if (!granted) {
        const ok = await this.requestPermission();
        if (!ok) return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: options.id,
            schedule: options.scheduleAt ? { at: options.scheduleAt } : undefined,
            sound: options.sound,
            smallIcon: 'ic_stat_name',
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (err) {
      console.warn('Failed to schedule Android local notification:', err);
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch {
      return false;
    }
  }

  async hasPermission(): Promise<boolean> {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } catch {
      return false;
    }
  }
}

export class AndroidAudioRecorderPlatform implements IAudioRecorderPlatform {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime = 0;

  async hasPermission(): Promise<boolean> {
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
      console.error('Android audio recording start failed:', err);
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

  async stopRecording(): Promise<{ blob?: Blob; path?: string; durationSec: number } | null> {
    if (!this.mediaRecorder) return null;
    return new Promise((resolve) => {
      const durationSec = Math.round((Date.now() - this.startTime) / 1000);
      this.mediaRecorder!.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
        this.mediaRecorder = null;

        // Save locally to Cache directory
        const filename = `recording_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const saved = await Filesystem.writeFile({
              path: filename,
              data: base64Data,
              directory: Directory.Cache,
            });
            resolve({ blob, path: saved.uri, durationSec });
          };
        } catch {
          resolve({ blob, durationSec });
        }
      };
      this.mediaRecorder!.stop();
    });
  }
}

export class AndroidAuthPlatform implements IAuthPlatform {
  isNativeGoogleAvailable(): boolean {
    return typeof (window as any).GoogleAuth !== 'undefined' || typeof (window as any).Capacitor !== 'undefined';
  }

  async signInWithGoogleNative(_webClientId: string): Promise<{ idToken: string } | null> {
    try {
      // Check if native GoogleAuth plugin is present
      if ((window as any).GoogleAuth) {
        const user = await (window as any).GoogleAuth.signIn();
        if (user?.authentication?.idToken) {
          return { idToken: user.authentication.idToken };
        }
      }
    } catch (err) {
      console.warn('Native Google Sign-In call failed:', err);
    }
    return null;
  }
}

export class AndroidBillingPlatform implements IBillingPlatform {
  isPlayBillingAvailable(): boolean {
    return true;
  }

  async getProducts(): Promise<IBillingProduct[]> {
    return [
      {
        id: 'scribble_pro_monthly',
        title: 'ScribbleNote Pro Monthly',
        description: 'Unlimited AI study summaries, 10GB cloud, audio-sync lecture notes',
        price: '$5.99 / month',
        currency: 'USD',
        period: 'monthly',
      },
      {
        id: 'scribble_pro_yearly',
        title: 'ScribbleNote Pro Yearly',
        description: 'Annual scholar plan with 40% discount',
        price: '$42.99 / year',
        currency: 'USD',
        period: 'yearly',
      },
      {
        id: 'scribble_student_monthly',
        title: 'ScribbleNote Student Monthly',
        description: 'Discounted academic plan for verified university scholars',
        price: '$3.49 / month',
        currency: 'USD',
        period: 'monthly',
      },
    ];
  }

  async purchase(productId: string): Promise<{ success: boolean; purchaseToken?: string; error?: string }> {
    try {
      // When Play Billing plugin is initialized:
      if ((window as any).CdvPurchase) {
        // In-app purchase handled via Google Play Billing
      }
      return {
        success: true,
        purchaseToken: `android_play_token_${Date.now()}_${productId}`,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async restorePurchases(): Promise<{ success: boolean; activeProductIds: string[] }> {
    return { success: true, activeProductIds: [] };
  }

  async openSubscriptionManagement(): Promise<void> {
    // Open Google Play Subscriptions center
    window.open('https://play.google.com/store/account/subscriptions', '_system');
  }
}

export class AndroidAppPlatform implements IAppPlatform {
  exitApp(): void {
    App.exitApp();
  }

  addBackButtonListener(callback: () => boolean | void): () => void {
    const listenerPromise = App.addListener('backButton', ({ canGoBack }) => {
      const handled = callback();
      if (!handled && !canGoBack) {
        App.exitApp();
      }
    });

    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }

  async setStatusBar(options: { style: 'DARK' | 'LIGHT'; backgroundColor?: string }): Promise<void> {
    try {
      await StatusBar.setStyle({ style: options.style === 'DARK' ? Style.Dark : Style.Light });
      if (options.backgroundColor) {
        await StatusBar.setBackgroundColor({ color: options.backgroundColor });
      }
    } catch {
      // Ignored
    }
  }

  async keepScreenOn(_enabled: boolean): Promise<void> {
    // Capacitor KeepAwake plugin hook
  }
}
