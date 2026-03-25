'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { groupWords } from '@/lib/utils/subtitleGrouper';
import { useFFmpeg } from './useFFmpeg';
import type { SubtitleSegment } from '@/lib/types';

export type TranscriptionStage = 'idle' | 'extracting' | 'uploading' | 'transcribing';

/** Hook pour transcrire une video via Whisper — extrait l'audio en MP3 d'abord */
export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<TranscriptionStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const { load: loadFFmpeg } = useFFmpeg();

  const transcribe = useCallback(async (videoFile: File): Promise<SubtitleSegment[]> => {
    setLoading(true);
    setError(null);

    try {
      const userId = getFirebaseAuth().currentUser?.uid;
      if (!userId) throw new Error('Non connecte');

      // Etape 1 : Extraire l'audio ou uploader la video directement
      let uploadBlob: Blob;
      let storagePath: string;

      // Essayer FFmpeg pour extraire l'audio (petit fichier ~1MB)
      // Fallback : upload la video directement si FFmpeg ne charge pas (Safari iOS)
      let ffmpegOk = false;
      setStage('extracting');
      console.log('[TRANSCRIBE] Stage: extracting audio. File size:', (videoFile.size / 1024 / 1024).toFixed(1) + 'MB');

      try {
        const ffmpeg = await loadFFmpeg();
        console.log('[TRANSCRIBE] FFmpeg loaded OK');
        const { fetchFile } = await import('@ffmpeg/util');
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
        console.log('[TRANSCRIBE] Video written to FFmpeg FS');
        await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '16000', '-ac', '1', '-b:a', '32k', 'audio.mp3']);
        console.log('[TRANSCRIBE] Audio extraction complete');
        const audioData = await ffmpeg.readFile('audio.mp3') as Uint8Array;
        uploadBlob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
        storagePath = `transcriptions/${userId}/${Date.now()}.mp3`;
        console.log('[TRANSCRIBE] Audio blob size:', (uploadBlob.size / 1024).toFixed(1) + 'KB');
        await ffmpeg.deleteFile('input.mp4').catch(() => {});
        await ffmpeg.deleteFile('audio.mp3').catch(() => {});
        ffmpegOk = true;
      } catch (e) {
        // FFmpeg ne marche pas (Safari iOS) — upload la video directement
        console.warn('[TRANSCRIBE] FFmpeg failed, uploading video directly:', e);
        uploadBlob = videoFile;
        storagePath = `transcriptions/${userId}/${Date.now()}.mp4`;
      }

      // Etape 2 : Upload
      setStage('uploading');
      console.log('[TRANSCRIBE] Stage: uploading', ffmpegOk ? 'audio MP3' : 'video MP4', 'size:', (uploadBlob.size / 1024 / 1024).toFixed(1) + 'MB');
      const storage = getFirebaseStorage();
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(ref(storage, storagePath), uploadBlob);
        task.on('state_changed',
          (snap) => console.log('[TRANSCRIBE] Upload:', Math.round(snap.bytesTransferred / snap.totalBytes * 100) + '%'),
          (err) => { console.error('[TRANSCRIBE] Upload error:', err); reject(err); },
          () => { console.log('[TRANSCRIBE] Upload complete'); resolve(); },
        );
      });

      // Etape 3 : Appeler la Cloud Function Whisper
      setStage('transcribing');
      console.log('[TRANSCRIBE] Stage: calling Whisper via', storagePath);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath }),
      });

      console.log('[TRANSCRIBE] Whisper response status:', res.status);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('[TRANSCRIBE] Whisper error:', data);
        throw new Error(data.error || 'La transcription a pris trop de temps. Essaie avec une video plus courte.');
      }
      const data = await res.json();
      console.log('[TRANSCRIBE] Whisper result: subtitles count:', data.subtitles?.length ?? 0);

      const words = (data.subtitles || []).map((w: { text: string; startTime: number; endTime: number }) => ({
        word: w.text, start: w.startTime, end: w.endTime,
      }));

      const segments = groupWords(words);
      console.log('[TRANSCRIBE] Grouped into', segments.length, 'segments');
      return segments;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de transcription';
      console.error('[TRANSCRIBE] FAILED at stage:', stage, 'error:', msg);
      setError(msg);
      return [];
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }, [loadFFmpeg]);

  return { transcribe, loading, stage, error };
}
