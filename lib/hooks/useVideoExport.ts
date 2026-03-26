'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFirebaseFirestore, getFirebaseAuth, getFirebaseStorage } from '@/lib/firebase';
import { exportWithWebCodecs } from '@/lib/utils/exportWebCodecs';
import { buildExportCommand } from '@/lib/utils/ffmpegCommands';
import { FILTERS } from '@/lib/utils/filters';
import { loadFont } from '@/lib/utils/fontLoader';
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
      for (const o of s.overlays) await loadFont(o.fontFamily);
      const filterCss = FILTERS.find(f => f.id === s.filter)?.css;

      // Seuil intelligent : WebCodecs pour < 100MB, FFmpeg pour les gros fichiers
      const fileSizeMB = s.videoFile.size / (1024 * 1024);
      const useWC = supportsWebCodecs && !s.audioUrl && fileSizeMB < 100;

      let blob: Blob;
      setState('exporting');

      if (useWC) {
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
          console.log('[EXPORT] Audio extracted via FFmpeg:', (audioBlob.size / 1024).toFixed(0) + 'KB');
        } catch (e) {
          console.warn('[EXPORT] FFmpeg audio failed, trying Web Audio API:', e);
          // Fallback Web Audio API (fonctionne sur Safari iOS)
          try {
            const ac = new AudioContext({ sampleRate: 48000 });
            const arrayBuf = await s.videoFile.arrayBuffer();
            const decoded = await ac.decodeAudioData(arrayBuf);
            await ac.close();
            // Encoder en WAV PCM 16-bit
            const nCh = Math.min(decoded.numberOfChannels, 2);
            const sr = decoded.sampleRate;
            const samples = decoded.getChannelData(0);
            const numSamples = samples.length;
            const wavBuf = new ArrayBuffer(44 + numSamples * 2);
            const view = new DataView(wavBuf);
            const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
            w(0,'RIFF'); view.setUint32(4, 36 + numSamples * 2, true); w(8,'WAVE');
            w(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
            view.setUint32(24,sr,true); view.setUint32(28,sr*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
            w(36,'data'); view.setUint32(40, numSamples * 2, true);
            for (let i = 0; i < numSamples; i++) {
              const s = Math.max(-1, Math.min(1, samples[i]));
              view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
            audioBlob = new Blob([wavBuf], { type: 'audio/wav' });
            console.log('[EXPORT] Audio extracted via Web Audio:', (audioBlob.size / 1024 / 1024).toFixed(1) + 'MB');
          } catch (e2) {
            console.error('[EXPORT] Both audio extraction methods failed:', e2);
          }
        }

        blob = await exportWithWebCodecs(
          s.videoFile, s.trimStart, s.trimEnd, setProgress,
          filterCss, s.overlays, s.subtitles, s.subtitleStyle, audioBlob,
        );
      } else {
        // Pipeline FFmpeg complet pour gros fichiers ou audio custom (une seule passe)
        const ffmpeg = await loadFFmpeg();
        const { fetchFile } = await import('@ffmpeg/util');
        ffmpeg.on('progress', ({ progress: p }) => setProgress(Math.round(p * 100)));
        await ffmpeg.writeFile('input.mp4', await fetchFile(s.videoFile));
        if (s.audioUrl) {
          const audioData = await fetch(s.audioUrl).then(r => r.arrayBuffer());
          await ffmpeg.writeFile('music.mp3', new Uint8Array(audioData));
        }
        await ffmpeg.exec(buildExportCommand({
          trimStart: s.trimStart, trimEnd: s.trimEnd, filter: s.filter,
          overlays: s.overlays, subtitles: s.subtitles, subtitleStyle: s.subtitleStyle,
          audioUrl: s.audioUrl, voiceVolume: s.voiceVolume, audioVolume: s.audioVolume,
          audioFadeIn: s.audioFadeIn, audioFadeOut: s.audioFadeOut,
        }));
        const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
        blob = new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' });
        terminateFFmpeg();
      }

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
