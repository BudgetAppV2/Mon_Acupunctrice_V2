'use client';

import { useState, useCallback } from 'react';
import { fixFrenchWord, fixFrenchText, capitalizeFirst } from '@/lib/utils/frenchPostProcess';
import { groupWords } from '@/lib/utils/subtitleGrouper';
import type { SubtitleSegment } from '@/lib/types';

const SAMPLE_RATE = 16000;
const CHUNK_SAMPLES = 300 * SAMPLE_RATE;  // 5 min
const OVERLAP_SAMPLES = 2 * SAMPLE_RATE;  // 2 sec overlap
const STEP_SAMPLES = CHUNK_SAMPLES - OVERLAP_SAMPLES;
const STEP_SECONDS = STEP_SAMPLES / SAMPLE_RATE; // 298s

/** Encode un Float32Array mono en WAV PCM 16-bit (nécessaire iOS Safari) */
function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

type RawWord = { text: string; startTime: number; endTime: number };

/**
 * Fusionne les mots de plusieurs chunks en corrigeant les offsets.
 * Chaque chunk non-final est tronqué à STEP_SECONDS pour éviter les doublons
 * dans la zone d'overlap : le chunk suivant couvre cette zone depuis son début.
 */
export function mergeChunkWords(
  chunkResults: RawWord[][],
  offsets: number[]
): { word: string; start: number; end: number }[] {
  const merged: { word: string; start: number; end: number }[] = [];

  for (let i = 0; i < chunkResults.length; i++) {
    const isLast = i === chunkResults.length - 1;
    const offset = offsets[i];

    for (const w of chunkResults[i]) {
      // Ignorer les mots de fin de chunk couverts par l'overlap du chunk suivant
      if (!isLast && w.startTime >= STEP_SECONDS) continue;
      merged.push({
        word: fixFrenchWord(w.text),
        start: w.startTime + offset,
        end: w.endTime + offset,
      });
    }
  }

  return merged;
}

async function transcribeBlob(blob: Blob): Promise<RawWord[]> {
  // Ne pas setter Content-Type : le browser le set avec le boundary multipart
  const formData = new FormData();
  formData.append('audio', blob, 'audio.wav');

  const res = await fetch('/api/transcribe', { method: 'POST', body: formData });

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error || 'La transcription a échoué. Essaie avec une vidéo plus courte.');
  }

  const data = await res.json() as { subtitles?: RawWord[] };
  return data.subtitles ?? [];
}

export type TranscriptionStage = 'idle' | 'extracting' | 'uploading' | 'transcribing';

export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<TranscriptionStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (videoFile: File): Promise<SubtitleSegment[]> => {
    setLoading(true);
    setError(null);

    try {
      // Étape 1 : Extraire l'audio via AudioContext (nécessaire iOS Safari)
      setStage('extracting');

      const ac = new AudioContext({ sampleRate: SAMPLE_RATE });
      const arrayBuf = await videoFile.arrayBuffer();
      const audioBuf = await ac.decodeAudioData(arrayBuf);
      await ac.close();

      const mono = audioBuf.getChannelData(0);

      // Étape 2 : Transcription via AssemblyAI (avec chunking si > 5 min)
      setStage('transcribing');

      let words: { word: string; start: number; end: number }[];

      if (mono.length <= CHUNK_SAMPLES) {
        // Vidéo courte : envoi direct
        const wav = encodeWav(mono, SAMPLE_RATE);
        const blob = new Blob([wav], { type: 'audio/wav' });
        const rawWords = await transcribeBlob(blob);

        words = rawWords.map(w => ({
          word: fixFrenchWord(w.text),
          start: w.startTime,
          end: w.endTime,
        }));
      } else {
        // Vidéo longue : chunks de 5 min avec overlap 2s
        const chunks: Float32Array[] = [];
        const offsets: number[] = [];

        for (let start = 0; start < mono.length; start += STEP_SAMPLES) {
          const end = Math.min(start + CHUNK_SAMPLES, mono.length);
          chunks.push(mono.slice(start, end));
          offsets.push(start / SAMPLE_RATE);
        }

        const chunkResults: RawWord[][] = [];
        for (const chunk of chunks) {
          const wav = encodeWav(chunk, SAMPLE_RATE);
          const blob = new Blob([wav], { type: 'audio/wav' });
          chunkResults.push(await transcribeBlob(blob));
        }

        words = mergeChunkWords(chunkResults, offsets);
      }

      const segments = groupWords(words);

      // Capitaliser le premier mot de chaque segment + corrections textuelles
      return segments.map(seg => ({
        ...seg,
        text: capitalizeFirst(fixFrenchText(seg.text)),
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de transcription';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }, []);

  return { transcribe, loading, stage, error };
}
