import { db } from './index';
import type { AttachmentRecord, AudioRecording } from '@/types/note';
import { getSupabaseClient } from '../supabase/client';
import { useAuthStore } from '../auth/useAuthStore';

export async function saveAudioAttachment(
  noteId: string,
  audioBlob: Blob,
  duration: number,
  name?: string
): Promise<AudioRecording> {
  const attachmentId = `att_audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const recordName =
    name ||
    `Lecture Voice Note ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const record: AttachmentRecord = {
    id: attachmentId,
    noteId,
    type: 'audio',
    mimeType: audioBlob.type || 'audio/webm',
    name: recordName,
    data: audioBlob,
    size: audioBlob.size,
    duration,
    createdAt: Date.now(),
  };

  await db.attachments.put(record);

  // If Supabase is configured, upload blob to cloud storage in the background
  const client = getSupabaseClient();
  const user = useAuthStore.getState().user;
  let cloudUrl: string | undefined;

  if (client && user && !user.isGuest) {
    try {
      const filePath = `${user.id}/${noteId}/${attachmentId}.webm`;
      const { data, error } = await client.storage
        .from('scribblenote-media')
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = client.storage
          .from('scribblenote-media')
          .getPublicUrl(filePath);
        cloudUrl = publicUrlData.publicUrl;
        await db.attachments.update(attachmentId, { storageUrl: cloudUrl });
      }
    } catch (err) {
      console.warn('Supabase storage upload background error (offline fallback active):', err);
    }
  }

  // Refresh quota
  useAuthStore.getState().refreshStorageUsage();

  return {
    id: attachmentId,
    attachmentId,
    name: recordName,
    duration,
    blobUrl: URL.createObjectURL(audioBlob),
    createdAt: record.createdAt,
  };
}

export async function getAttachmentBlob(attachmentId: string): Promise<Blob | null> {
  const record = await db.attachments.get(attachmentId);
  return record?.data || null;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await db.attachments.delete(attachmentId);
  useAuthStore.getState().refreshStorageUsage();
}
