'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { groupWords } from '@/lib/utils/subtitleGrouper';
import type { SubtitleSegment } from '@/lib/types';

/** Encode un Float32Array mono en WAV PCM 16-bit */
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

export type TranscriptionStage = 'idle' | 'extracting' | 'uploading' | 'transcribing';

export function useTranscription() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<TranscriptionStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (videoFile: File): Promise<SubtitleSegment[]> => {
    setLoading(true);
    setError(null);

    try {
      const userId = getFirebaseAuth().currentUser?.uid;
      if (!userId) throw new Error('Non connecte');

      // Etape 1 : Extraire l'audio via Web Audio API
      setStage('extracting');
      console.log('[TRANSCRIBE] Stage: extracting audio. File size:', (videoFile.size / 1024 / 1024).toFixed(1) + 'MB');

      let uploadBlob: Blob;
      let storagePath: string;

      try {
        // Créer un blob URL et décoder via AudioContext
        // On utilise decodeAudioData sur le arrayBuffer du fichier
        // Safari iOS supporte ça même sans FFmpeg
        const ac = new AudioContext({ sampleRate: 16000 });
        console.log('[TRANSCRIBE] AudioContext created, reading file...');
        
        const arrayBuf = await videoFile.arrayBuffer();
        console.log('[TRANSCRIBE] ArrayBuffer read OK:', (arrayBuf.byteLength / 1024 / 1024).toFixed(1) + 'MB, decoding...');
        
        const audioBuf = await ac.decodeAudioData(arrayBuf);
        console.log('[TRANSCRIBE] Audio decoded:', audioBuf.duration.toFixed(1) + 's,', audioBuf.numberOfChannels, 'ch,', audioBuf.sampleRate + 'Hz');
        await ac.close();

        const mono = audioBuf.getChannelData(0);
        const wavBuffer = encodeWav(mono, 16000);
        uploadBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        storagePath = `transcriptions/${userId}/${Date.now()}.wav`;
        console.log('[TRANSCRIBE] WAV created:', (uploadBlob.size / 1024).toFixed(0) + 'KB');
      } catch (e) {
        console.error('[TRANSCRIBE] Audio extraction FAILED:', e instanceof Error ? e.message : e);
        
        // Fallback : uploader la vidéo directement (la CF doit gérer)
        console.warn('[TRANSCRIBE] Fallback: uploading full video');
        uploadBlob = videoFile;
        storagePath = `transcriptions/${userId}/${Date.now()}.mp4`;
      }

      // Etape 2 : Upload
      setStage('uploading');
      console.log('[TRANSCRIBE] Uploading', storagePath.split('.').pop(), (uploadBlob.size / 1024 / 1024).toFixed(1) + 'MB');
      const storage = getFirebaseStorage();
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(ref(storage, storagePath), uploadBlob);
        task.on('state_changed',
          (snap) => console.log('[TRANSCRIBE] Upload:', Math.round(snap.bytesTransferred / snap.totalBytes * 100) + '%'),
          (err) => { console.error('[TRANSCRIBE] Upload error:', err); reject(err); },
          () => { console.log('[TRANSCRIBE] Upload complete'); resolve(); },
        );
      });

      // Etape 3 : Whisper
      setStage('transcribing');
      console.log('[TRANSCRIBE] Calling Whisper via', storagePath);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath }),
      });

      console.log('[TRANSCRIBE] Whisper status:', res.status);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('[TRANSCRIBE] Whisper error:', data);
        throw new Error(data.error || 'La transcription a echoue. Essaie avec une video plus courte.');
      }
      const data = await res.json();
      console.log('[TRANSCRIBE] Raw response keys:', Object.keys(data));
      console.log('[TRANSCRIBE] Raw response:', JSON.stringify(data).substring(0, 500));
      console.log('[TRANSCRIBE] Result:', data.subtitles?.length ?? 0, 'words');

      const words = (data.subtitles || []).map((w: { text: string; startTime: number; endTime: number }) => ({
        word: w.text, start: w.startTime, end: w.endTime,
      }));

      const segments = groupWords(words);
      console.log('[TRANSCRIBE] Grouped into', segments.length, 'segments');
      return segments;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de transcription';
      console.error('[TRANSCRIBE] FAILED:', msg);
      setError(msg);
      return [];
    } finally {
      setLoading(false);
      setStage('idle');
    }
  }, []);

  return { transcribe, loading, stage, error };
}
