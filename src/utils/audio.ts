import type { AudioRecording } from '../types/note';

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private timerInterval: number | null = null;
  private onTickCallback?: (seconds: number) => void;

  public async start(onTick?: (seconds: number) => void): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.onTickCallback = onTick;
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250);

      if (this.onTickCallback) {
        this.timerInterval = window.setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          this.onTickCallback?.(elapsed);
        }, 1000);
      }

      return true;
    } catch (err) {
      console.warn('Microphone permission denied or not available', err);
      return false;
    }
  }

  public stop(): Promise<AudioRecording | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        if (this.timerInterval) clearInterval(this.timerInterval);
        resolve(null);
        return;
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
        const blobUrl = URL.createObjectURL(audioBlob);

        // Convert to base64 for persistent offline storage in Dexie
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          const recording: AudioRecording = {
            id: 'rec_' + Math.random().toString(36).substring(2, 9),
            name: `Lecture Audio Clip ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            duration,
            blobUrl,
            base64Data,
            createdAt: Date.now(),
          };
          resolve(recording);
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.stop();
    });
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
