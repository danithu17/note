import type { LectureNote, CanvasElement } from '../types/note';

export type SyncMessage =
  | { type: 'NOTE_UPDATED'; note: LectureNote; sourceDeviceId: string }
  | { type: 'STROKE_ADDED'; noteId: string; element: CanvasElement; sourceDeviceId: string }
  | { type: 'CANVAS_UPDATED'; noteId: string; elements: CanvasElement[]; sourceDeviceId: string }
  | { type: 'NOTE_DELETED'; noteId: string; sourceDeviceId: string }
  | { type: 'PING'; sourceDeviceId: string; deviceName: string }
  | { type: 'PONG'; sourceDeviceId: string; deviceName: string };

const CHANNEL_NAME = 'scribblenote_realtime_sync';
const DEVICE_ID_KEY = 'scribblenote_device_id';

// Generate or get persistent unique device ID
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceName(): string {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isMobile ? 'Mobile Stylus Device' : 'Desktop Laptop';
}

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(msg: SyncMessage) => void> = new Set();
  private connectedPeers: Set<string> = new Set();
  private isCloudConnected: boolean = false;
  private cloudConfig: { apiKey?: string; projectId?: string; url?: string } | null = null;

  constructor() {
    this.initBroadcastChannel();
    this.loadCloudConfig();
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          const msg = event.data as SyncMessage;
          if (msg && msg.sourceDeviceId !== getDeviceId()) {
            this.handleIncomingMessage(msg);
          }
        };

        // Ping other tabs/devices
        this.broadcast({
          type: 'PING',
          sourceDeviceId: getDeviceId(),
          deviceName: getDeviceName(),
        });
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }

  private loadCloudConfig() {
    try {
      const saved = localStorage.getItem('scribblenote_cloud_config');
      if (saved) {
        this.cloudConfig = JSON.parse(saved);
        this.isCloudConnected = !!(this.cloudConfig?.projectId || this.cloudConfig?.url);
      }
    } catch {
      // ignore
    }
  }

  public saveCloudConfig(config: { apiKey?: string; projectId?: string; url?: string }) {
    this.cloudConfig = config;
    this.isCloudConnected = !!(config.projectId || config.url);
    localStorage.setItem('scribblenote_cloud_config', JSON.stringify(config));
  }

  public getCloudConfig() {
    return this.cloudConfig;
  }

  public isCloudSyncActive(): boolean {
    return this.isCloudConnected;
  }

  public getConnectedPeerCount(): number {
    return this.connectedPeers.size;
  }

  private handleIncomingMessage(msg: SyncMessage) {
    if (msg.type === 'PING') {
      this.connectedPeers.add(msg.sourceDeviceId);
      // Reply with PONG
      this.broadcast({
        type: 'PONG',
        sourceDeviceId: getDeviceId(),
        deviceName: getDeviceName(),
      });
    } else if (msg.type === 'PONG') {
      this.connectedPeers.add(msg.sourceDeviceId);
    }

    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in sync listener', err);
      }
    });
  }

  public subscribe(listener: (msg: SyncMessage) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(msg: SyncMessage) {
    try {
      if (this.channel) {
        this.channel.postMessage(msg);
      }
      // Also write to localStorage for cross-context storage event fallback
      if (msg.type === 'NOTE_UPDATED' || msg.type === 'CANVAS_UPDATED') {
        localStorage.setItem(
          'scribble_last_sync_event',
          JSON.stringify({ ...msg, ts: Date.now() })
        );
      }
    } catch (err) {
      console.warn('Failed to broadcast message', err);
    }
  }
}

export const realtimeSync = new RealtimeSyncManager();
