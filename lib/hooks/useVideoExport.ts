'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    setState('preparing');
    setProgress(0);
    setError(null);

    try {
      for (const o of s.overlays) await loadFont(o.fontFamily);
      const filterCss = FILTERS.find(f => f.id === s.filter)?.css;
      // FFmpeg requis quand une piste audio est présente (pour le mixage)
      const useWC = supportsWebCodecs && !s.audioUrl;

      let blob: Blob;
      setState('exporting');

      if (useWC) {
        blob = await exportWithWebCodecs(
          s.videoFile, s.trimStart, s.trimEnd, setProgress,
          filterCss, s.overlays, s.subtitles, s.subtitleStyle,
        );
      } else {
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

      setState('uploading');
      const userId = getFirebaseAuth().currentUser?.uid;
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `videos/${userId}/${s.itemId}/export.mp4`);
      await uploadBytes(storageRef, blob);
      const videoUrl = await getDownloadURL(storageRef);

      const db = getFirebaseFirestore();
      await updateDoc(doc(db, 'contentItems', s.itemId), {
        videoUrl, workflowState: 'ready', updatedAt: serverTimestamp(),
      });

      setState('done');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Export échoué');
    }
  }, [supportsWebCodecs, loadFFmpeg, terminateFFmpeg]);

  return { exportVideo, state, progress, error, supportsWebCodecs };
}
