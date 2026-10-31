import { db } from '../db';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/client';
import type { SyncStatus, SyncQueueRecord, CanvasElement, LectureNote } from '@/types/note';
import { getDeviceId } from '@/utils/sync';

export type SyncListener = (status: SyncStatus) => void;

class OfflineFirstSyncEngine {
  private listeners: Set<SyncListener> = new Set();
  private isProcessingQueue = false;
  private queueInterval: number | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private status: SyncStatus = {
    state: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced',
    lastSynced: Date.now(),
    mode: isSupabaseConfigured() ? 'supabase' : 'broadcast',
    pendingQueueCount: 0,
  };

  constructor() {
    this.initNetworkListeners();
    this.initBroadcastChannel();
    this.startQueueWorker();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.status);
    }
  }

  private updateStatus(updates: Partial<SyncStatus>) {
    this.status = { ...this.status, ...updates };
    this.notify();
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.updateStatus({ state: 'syncing' });
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.updateStatus({ state: 'offline' });
    });
  }

  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    try {
      this.broadcastChannel = new BroadcastChannel('scribblenote_crdt_mesh');
      this.broadcastChannel.onmessage = (event) => {
        const msg = event.data;
        if (msg && msg.sourceDeviceId !== getDeviceId()) {
          this.handleIncomingBroadcast(msg);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel initialization skipped:', e);
    }
  }

  private async handleIncomingBroadcast(msg: any) {
    if (msg.type === 'NOTE_SYNC') {
      const remoteNote = msg.note as LectureNote;
      const localNote = await db.notes.get(remoteNote.id);

      if (!localNote || remoteNote.updatedAt > (localNote.updatedAt || 0)) {
        await db.notes.put(remoteNote);
        this.updateStatus({ lastSynced: Date.now() });
      }
    } else if (msg.type === 'STROKE_APPEND') {
      const { noteId, stroke } = msg;
      const localNote = await db.notes.get(noteId);
      if (localNote) {
        const exists = localNote.canvasElements.some((el) => el.id === stroke.id);
        if (!exists) {
          const updatedElements = [...localNote.canvasElements, stroke];
          await db.notes.update(noteId, {
            canvasElements: updatedElements,
            updatedAt: Date.now(),
          });
          this.updateStatus({ lastSynced: Date.now() });
        }
      }
    }
  }

  public broadcastLocalChange(type: 'NOTE_SYNC' | 'STROKE_APPEND', data: any) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type,
          ...data,
          sourceDeviceId: getDeviceId(),
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn('Broadcast error:', err);
      }
    }
  }

  public async enqueue(
    action: SyncQueueRecord['action'],
    entityType: SyncQueueRecord['entityType'],
    entityId: string,
    payload: any
  ) {
    const queueRecord: SyncQueueRecord = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      entityType,
      entityId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    await db.syncQueue.put(queueRecord);
    const count = await db.syncQueue.count();
    this.updateStatus({ pendingQueueCount: count });

    if (entityType === 'note') {
      this.broadcastLocalChange('NOTE_SYNC', { note: payload });
    } else if (entityType === 'canvas_stroke') {
      this.broadcastLocalChange('STROKE_APPEND', {
        noteId: payload.noteId,
        stroke: payload.element,
      });
    }

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  private startQueueWorker() {
    if (typeof window === 'undefined') return;

    this.queueInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isProcessingQueue) {
        this.processQueue();
      }
    }, 5000);
  }

  public stopQueueWorker() {
    if (this.queueInterval) {
      clearInterval(this.queueInterval);
      this.queueInterval = null;
    }
  }

  public async processQueue() {
    if (this.isProcessingQueue) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateStatus({ state: 'offline' });
      return;
    }

    const client = getSupabaseClient();
    const pendingItems = await db.syncQueue.where('status').equals('pending').sortBy('timestamp');

    const totalCount = await db.syncQueue.count();
    this.updateStatus({ pendingQueueCount: totalCount });

    if (!client) {
      this.updateStatus({
        state: 'synced',
        mode: 'broadcast',
        lastSynced: Date.now(),
      });
      return;
    }

    if (pendingItems.length === 0) {
      this.updateStatus({
        state: 'synced',
        mode: 'supabase',
        lastSynced: Date.now(),
        pendingQueueCount: 0,
      });
      return;
    }

    this.isProcessingQueue = true;
    this.updateStatus({ state: 'syncing', mode: 'supabase' });

    for (const item of pendingItems) {
      try {
        await this.syncItemToCloud(client, item);
        await db.syncQueue.delete(item.id);
      } catch (err: any) {
        console.warn(`Sync queue processing failure for item ${item.id}:`, err);
        const nextRetry = item.retryCount + 1;
        if (nextRetry >= 5) {
          await db.syncQueue.update(item.id, {
            status: 'failed',
            retryCount: nextRetry,
            lastError: err.message || 'Exceeded retry limit',
          });
          this.updateStatus({ state: 'conflict', errorMessage: 'Sync conflict detected' });
        } else {
          await db.syncQueue.update(item.id, {
            retryCount: nextRetry,
            lastError: err.message,
          });
        }
      }
    }

    const remaining = await db.syncQueue.count();
    this.isProcessingQueue = false;
    this.updateStatus({
      state: remaining > 0 ? 'syncing' : 'synced',
      pendingQueueCount: remaining,
      lastSynced: Date.now(),
    });
  }

  private async syncItemToCloud(client: any, item: SyncQueueRecord) {
    const { action, entityType, payload } = item;

    if (entityType === 'note') {
      if (action === 'delete') {
        const { error } = await client.from('notes').delete().eq('id', item.entityId);
        if (error) throw error;
      } else {
        const note = payload as LectureNote;
        const row = {
          id: note.id,
          workspace_id: note.workspaceId || 'ws_default',
          notebook_id: note.notebookId || 'nb_default',
          title: note.title,
          subject: note.subject || 'General',
          tags: note.tags || [],
          markdown: note.markdown || '',
          grid_type: note.gridType || 'dots',
          active_page_index: note.activePageIndex || 0,
          pages: note.pages || [],
          canvas_elements: note.canvasElements || [],
          is_pinned: !!note.isPinned,
          deleted_at: note.deletedAt || null,
          version: note.version || 1,
          created_at: note.createdAt,
          updated_at: note.updatedAt,
        };
        const { error } = await client.from('notes').upsert(row);
        if (error) throw error;
      }
    } else if (entityType === 'notebook') {
      if (action === 'delete') {
        const { error } = await client.from('notebooks').delete().eq('id', item.entityId);
        if (error) throw error;
      } else {
        const row = {
          id: payload.id,
          workspace_id: payload.workspaceId,
          title: payload.title,
          color: payload.color || '#3b82f6',
          icon: payload.icon || 'book',
          description: payload.description || '',
          created_at: payload.createdAt,
          updated_at: payload.updatedAt,
        };
        const { error } = await client.from('notebooks').upsert(row);
        if (error) throw error;
      }
    } else if (entityType === 'workspace') {
      if (action === 'delete') {
        const { error } = await client.from('workspaces').delete().eq('id', item.entityId);
        if (error) throw error;
      } else {
        const row = {
          id: payload.id,
          name: payload.name,
          icon: payload.icon || 'folder',
          color: payload.color || '#3b82f6',
          created_at: payload.createdAt,
          updated_at: payload.updatedAt,
        };
        const { error } = await client.from('workspaces').upsert(row);
        if (error) throw error;
      }
    } else if (entityType === 'canvas_stroke') {
      const row = {
        id: payload.element.id,
        note_id: payload.noteId,
        page_index: payload.pageIndex || 0,
        stroke_data: payload.element,
        created_at: payload.element.timestamp || Date.now(),
      };
      const { error } = await client.from('canvas_strokes').upsert(row);
      if (error) throw error;
    }
  }

  public reconcileStrokes(
    localStrokes: CanvasElement[],
    remoteStrokes: CanvasElement[]
  ): CanvasElement[] {
    const strokeMap = new Map<string, CanvasElement>();

    for (const stroke of localStrokes) {
      strokeMap.set(stroke.id, stroke);
    }

    for (const remote of remoteStrokes) {
      const existing = strokeMap.get(remote.id);
      if (!existing || (remote.timestamp && remote.timestamp >= (existing.timestamp || 0))) {
        strokeMap.set(remote.id, remote);
      }
    }

    return Array.from(strokeMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public async forceSync() {
    this.updateStatus({ state: 'syncing' });
    await this.processQueue();
  }
}

export const syncEngine = new OfflineFirstSyncEngine();
