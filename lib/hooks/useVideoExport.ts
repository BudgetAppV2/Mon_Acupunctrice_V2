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
    const { videoFile, trimStart, trimEnd, itemId, filter, overlays } = useEditorStore.getState();
    if (!videoFile || !itemId) return;

    setState('preparing');
    setProgress(0);
    setError(null);

    try {
      // Charger les polices utilisées par les overlays pour le canvas export
      for (const o of overlays) await loadFont(o.fontFamily);
      const filterCss = FILTERS.find(f => f.id === filter)?.css;

      let blob: Blob;
      setState('exporting');

      if (supportsWebCodecs) {
        blob = await exportWithWebCodecs(videoFile, trimStart, trimEnd, setProgress, filterCss, overlays);
      } else {
        const ffmpeg = await loadFFmpeg();
        const { fetchFile } = await import('@ffmpeg/util');
        ffmpeg.on('progress', ({ progress: p }) => setProgress(Math.round(p * 100)));
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
        await ffmpeg.exec(buildExportCommand(trimStart, trimEnd, filter, overlays));
        const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
        blob = new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' });
        terminateFFmpeg();
      }

      setState('uploading');
      const userId = getFirebaseAuth().currentUser?.uid;
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `videos/${userId}/${itemId}/export.mp4`);
      await uploadBytes(storageRef, blob);
      const videoUrl = await getDownloadURL(storageRef);

      const db = getFirebaseFirestore();
      await updateDoc(doc(db, 'contentItems', itemId), {
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
