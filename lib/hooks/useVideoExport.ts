'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFirebaseFirestore, getFirebaseAuth, getFirebaseStorage } from '@/lib/firebase';
import { exportWithWebCodecs } from '@/lib/utils/exportWebCodecs';
import { FILTERS } from '@/lib/utils/filters';
import { loadFont } from '@/lib/utils/fontLoader';
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';
import { useFFmpeg } from './useFFmpeg';

export type ExportState = 'idle' | 'preparing' | 'exporting' | 'uploading' | 'done' | 'error';

export function useVideoExport() {
  const [state, setState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { load: loadFFmpeg, terminate: terminateFFmpeg } = useFFmpeg();

  const supportsWebCodecs = typeof window !== 'undefined'
    && typeof VideoEncoder !== 'undefined'
    && 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

  const exportVideo = useCallback(async () => {
    const s = useEditorStore.getState();
    if (!s.videoFile || !s.itemId) return;
    if (s.clips.length > 1) { setState('error'); setError('L\'export multi-clip sera disponible prochainement. Seul le premier clip est exporte.'); return; }

    setState('preparing');
    setProgress(0);
    setError(null);

    try {
      if (!supportsWebCodecs) {
        throw new Error('Ton navigateur ne supporte pas l\'export video. Utilise Safari 17+ ou Chrome.');
      }

      for (const o of s.overlays) await loadFont(o.fontFamily);

      setState('exporting');

      // Extraire l'audio — FFmpeg d'abord, fallback Web Audio API (Safari iOS)
      let audioBlob: Blob | null = null;
      try {
        const ffmpeg = await loadFFmpeg();
        const buf = await s.videoFile.arrayBuffer();
        await ffmpeg.writeFile('input.mp4', new Uint8Array(buf));
        await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-ar', '48000', '-ac', '2', '-b:a', '128k', 'audio.mp3']);
        const audioData = await ffmpeg.readFile('audio.mp3') as Uint8Array;
        audioBlob = new Blob([audioData.buffer as ArrayBuffer], { type: 'audio/mpeg' });
        await ffmpeg.deleteFile('input.mp4').catch(() => {});
        await ffmpeg.deleteFile('audio.mp3').catch(() => {});
        terminateFFmpeg();
      } catch {
        // Fallback Web Audio API (fonctionne sur Safari iOS)
        try {
          const ac = new AudioContext({ sampleRate: 48000 });
          const arrayBuf = await s.videoFile.arrayBuffer();
          const decoded = await ac.decodeAudioData(arrayBuf);
          await ac.close();
          const sr = decoded.sampleRate;
          const samples = decoded.getChannelData(0);
          const numSamples = samples.length;
          const wavBuf = new ArrayBuffer(44 + numSamples * 2);
          const view = new DataView(wavBuf);
          const w = (o: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(o + i, str.charCodeAt(i)); };
          w(0,'RIFF'); view.setUint32(4, 36 + numSamples * 2, true); w(8,'WAVE');
          w(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
          view.setUint32(24,sr,true); view.setUint32(28,sr*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
          w(36,'data'); view.setUint32(40, numSamples * 2, true);
          for (let i = 0; i < numSamples; i++) {
            const v = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7FFF, true);
          }
          audioBlob = new Blob([wavBuf], { type: 'audio/wav' });
        } catch {
          // Pas d'audio — export sans son
        }
      }

      const filterCss = FILTERS.find(f => f.id === s.filter)?.css ?? 'none';
      const theme = getTheme(s.activeThemeId);
      const palette = getThemePalette(theme);
      const blob = await exportWithWebCodecs(
        s.videoFile, s.trimStart, s.trimEnd, setProgress,
        filterCss, s.overlays, s.subtitles, s.subtitleStyle, audioBlob, palette,
      );

      // Upload resumable avec progression
      setState('uploading');
      const userId = getFirebaseAuth().currentUser?.uid;
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `videos/${userId}/${s.itemId}/export.mp4`);
      const videoUrl = await new Promise<string>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, blob);
        task.on('state_changed',
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => { resolve(await getDownloadURL(storageRef)); },
        );
      });

      let thumbnailUrl: string | null = null;
      const thumbDataUrl = useEditorStore.getState().thumbnailUrl;
      if (thumbDataUrl && userId) {
        try {
          const thumbBlob = await fetch(thumbDataUrl).then(r => r.blob());
          const thumbRef = ref(storage, `thumbnails/${userId}/${s.itemId}.jpg`);
          await uploadBytesResumable(thumbRef, thumbBlob, { contentType: 'image/jpeg' });
          thumbnailUrl = await getDownloadURL(thumbRef);
        } catch { /* thumbnail echoue — non bloquant */ }
      }

      const db = getFirebaseFirestore();
      await setDoc(doc(db, 'contentItems', s.itemId), {
        videoUrl, exportedAt: serverTimestamp(), workflowState: 'ready', updatedAt: serverTimestamp(),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      }, { merge: true });

      setState('done');
    } catch (err) {
      setState('error');
      const msg = err instanceof Error ? err.message : 'Export echoue';
      if (msg.includes('memory') || msg.includes('OOM') || msg.includes('allocation')) {
        setError('La video est trop volumineuse. Essaie de la trimmer a moins de 60 secondes.');
      } else if (msg.includes('network') || msg.includes('upload')) {
        setError('La sauvegarde a echoue. Verifie ta connexion et reessaie.');
      } else {
        setError(msg);
      }
    }
  }, [supportsWebCodecs, loadFFmpeg, terminateFFmpeg]);

  return { exportVideo, state, progress, error, supportsWebCodecs };
}
