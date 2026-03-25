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
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '16000', '-ac', '1', '-b:a', '32k', 'audio.mp3']);
      const audioData = await ffmpeg.readFile('audio.mp3') as Uint8Array;
      const audioBlob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
      // Cleanup fichiers FFmpeg
      await ffmpeg.deleteFile('input.mp4').catch(() => {});
      await ffmpeg.deleteFile('audio.mp3').catch(() => {});

      // Etape 2 : Upload le MP3 (~1-2MB) au lieu de la video (~200MB)
      setStage('uploading');
      const storagePath = `transcriptions/${userId}/${Date.now()}.mp3`;
      const storage = getFirebaseStorage();
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(ref(storage, storagePath), audioBlob);
        task.on('state_changed', null, reject, () => resolve());
      });

      // Etape 3 : Appeler la Cloud Function Whisper
      setStage('transcribing');
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'La transcription a pris trop de temps. Essaie avec une video plus courte.');
      }
      const data = await res.json();

      const words = (data.subtitles || []).map((w: { text: string; startTime: number; endTime: number }) => ({
        word: w.text, start: w.startTime, end: w.endTime,
      }));

      return groupWords(words);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de transcription';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }, [loadFFmpeg]);

  return { transcribe, loading, stage, error };
}
