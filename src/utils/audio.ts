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
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : undefined,
      });
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

  public stop(): Promise<{ blob: Blob; duration: number } | null> {
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

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm',
        });
        const duration = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));

        // Stop all media tracks to release hardware microphone
        this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());

        resolve({ blob: audioBlob, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
