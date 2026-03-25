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

      // Etape 1 : Extraire l'audio en MP3 compresse via FFmpeg (~1MB/min au lieu de 50-200MB)
      setStage('extracting');
      console.log('[TRANSCRIBE] Stage: extracting audio. File size:', (videoFile.size / 1024 / 1024).toFixed(1) + 'MB');
      let ffmpeg;
      try {
        ffmpeg = await loadFFmpeg();
        console.log('[TRANSCRIBE] FFmpeg loaded OK');
      } catch (e) {
        console.error('[TRANSCRIBE] FFmpeg load FAILED:', e);
        throw new Error('Impossible de charger FFmpeg. Reessaie.');
      }
      try {
        const { fetchFile } = await import('@ffmpeg/util');
        console.log('[TRANSCRIBE] fetchFile imported, reading video into WASM...');
        const fileData = await fetchFile(videoFile);
        console.log('[TRANSCRIBE] fetchFile done, size:', fileData.byteLength, 'writing to FS...');
        await ffmpeg.writeFile('input.mp4', fileData);
        console.log('[TRANSCRIBE] Video written to FFmpeg FS');
      } catch (e) {
        console.error('[TRANSCRIBE] fetchFile/writeFile FAILED:', e);
        throw new Error('Fichier trop volumineux pour l\'extraction audio. Essaie une video plus courte.');
      }
      await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '16000', '-ac', '1', '-b:a', '32k', 'audio.mp3']);
      console.log('[TRANSCRIBE] Audio extraction complete');
      const audioData = await ffmpeg.readFile('audio.mp3') as Uint8Array;
      const audioBlob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
      console.log('[TRANSCRIBE] Audio blob size:', (audioBlob.size / 1024).toFixed(1) + 'KB');
      // Cleanup fichiers FFmpeg
      await ffmpeg.deleteFile('input.mp4').catch(() => {});
      await ffmpeg.deleteFile('audio.mp3').catch(() => {});

      // Etape 2 : Upload le MP3 (~1-2MB) au lieu de la video (~200MB)
      setStage('uploading');
      console.log('[TRANSCRIBE] Stage: uploading audio');
      const storagePath = `transcriptions/${userId}/${Date.now()}.mp3`;
      const storage = getFirebaseStorage();
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(ref(storage, storagePath), audioBlob);
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
