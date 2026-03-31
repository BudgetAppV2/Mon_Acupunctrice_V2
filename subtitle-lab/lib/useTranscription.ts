'use client';

import { useState, useCallback } from 'react';
import { fixFrenchWord, fixFrenchText, capitalizeFirst } from './frenchPostProcess';
import { groupWords } from './subtitleGrouper';
import type { SubtitleBlock } from './types';

const SAMPLE_RATE = 16000;

type RawWord = { text: string; startTime: number; endTime: number };

export type TranscriptionStage = 'idle' | 'extracting' | 'transcribing';

/** Encode a Float32Array mono to WAV PCM 16-bit (required for iOS Safari) */
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

/** Convert SubtitleGrouper segment to Lab SubtitleBlock */
function segmentToBlock(seg: {
  id: string; text: string; startTime: number; endTime: number;
  words: { word: string; start: number; end: number }[];
}): SubtitleBlock {
  return {
    id: seg.id,
    text: seg.text,
    startMs: seg.startTime * 1000,
    endMs: seg.endTime * 1000,
    words: seg.words.map(w => ({
      text: w.word,
      startMs: w.start * 1000,
      endMs: w.end * 1000,
    })),
  };
}

export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<TranscriptionStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (videoFile: File): Promise<SubtitleBlock[]> => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Extract audio via AudioContext (required for iOS Safari)
      setStage('extracting');
      const ac = new AudioContext({ sampleRate: SAMPLE_RATE });
      const arrayBuf = await videoFile.arrayBuffer();
      const audioBuf = await ac.decodeAudioData(arrayBuf);
      await ac.close();

      const mono = audioBuf.getChannelData(0);

      // Step 2: Encode to WAV and send to API
      setStage('transcribing');
      const wav = encodeWav(mono, SAMPLE_RATE);
      const blob = new Blob([wav], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', blob, 'audio.wav');

      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || 'La transcription a echoue.');
      }

      const data = await res.json() as { subtitles?: RawWord[] };
      const rawWords = data.subtitles ?? [];

      // Step 3: Post-process French + group words
      const words = rawWords.map(w => ({
        word: fixFrenchWord(w.text),
        start: w.startTime,
        end: w.endTime,
      }));

      const segments = groupWords(words);

      // Step 4: Convert to SubtitleBlock[] with French fixes
      return segments.map(seg => {
        const fixed = { ...seg, text: capitalizeFirst(fixFrenchText(seg.text)) };
        return segmentToBlock(fixed);
      });
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
