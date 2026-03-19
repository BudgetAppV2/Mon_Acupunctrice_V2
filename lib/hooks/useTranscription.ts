'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytes } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { groupWords } from '@/lib/utils/subtitleGrouper';
import type { SubtitleSegment } from '@/lib/types';

/** Hook pour transcrire une vidéo via Whisper (Cloud Function) */
export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (videoFile: File): Promise<SubtitleSegment[]> => {
    setLoading(true);
    setError(null);

    try {
      // Upload la vidéo dans un dossier temp pour la Cloud Function
      const userId = getFirebaseAuth().currentUser?.uid;
      const ext = videoFile.name.split('.').pop() || 'mp4';
      const storagePath = `temp/${userId}/${Date.now()}.${ext}`;
      const storage = getFirebaseStorage();
      await uploadBytes(ref(storage, storagePath), videoFile);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath }),
      });

      if (!res.ok) throw new Error('Transcription échouée');
      const data = await res.json();

      // Mapper les mots Whisper vers le format SubtitleWord et grouper
      const words = (data.subtitles || []).map((w: { text: string; startTime: number; endTime: number }) => ({
        word: w.text,
        start: w.startTime,
        end: w.endTime,
      }));

      return groupWords(words);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de transcription');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { transcribe, loading, error };
}
