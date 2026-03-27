'use client';

import { useState, useCallback } from 'react';
import { detectSilences, type SilenceRange } from '@/lib/utils/silenceDetector';

/**
 * Hook pour detecter les silences dans un fichier video.
 * Extrait l'audio via Web Audio API puis scanne les amplitudes.
 */
export function useSilenceDetection() {
  const [silences, setSilences] = useState<SilenceRange[]>([]);
  const [loading, setLoading] = useState(false);

  const detect = useCallback(async (file: File, minDuration = 0.8) => {
    setLoading(true);
    try {
      const ac = new AudioContext({ sampleRate: 16000 });
      const buf = await file.arrayBuffer();
      const audio = await ac.decodeAudioData(buf);
      await ac.close();
      const result = detectSilences(audio, minDuration);
      setSilences(result);
      return result;
    } catch {
      setSilences([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setSilences([]), []);

  return { silences, loading, detect, clear };
}
