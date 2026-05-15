'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFirebaseFirestore, getFirebaseAuth, getFirebaseStorage } from '@/lib/firebase';
import { exportWithWebCodecs } from '@/lib/utils/exportWebCodecs';
import { FILTERS } from '@/lib/utils/filters';
import { loadFont } from '@/lib/utils/fontLoader';
import { buildExportScene } from '@/lib/editor/buildExportScene';

export type ExportState = 'idle' | 'preparing' | 'exporting' | 'uploading' | 'done' | 'error';

export function useVideoExport() {
  const [state, setState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supportsWebCodecs = typeof window !== 'undefined'
    && typeof VideoEncoder !== 'undefined'
    && 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

  const exportVideo = useCallback(async () => {
    const s = useEditorStore.getState();
    if (!s.videoFile || !s.itemId) return;
    if (s.clips.length > 1) { setState('error'); setError('L\'export multi-clip sera disponible prochainement.'); return; }

    setState('preparing');
    setProgress(0);
    setError(null);

    try {
      // --- Debug mobile ---
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      console.log('[DIAG] Device:', ua);
      console.log('[DIAG] iOS:', isIOS, '| VideoEncoder:', typeof VideoEncoder !== 'undefined', '| rVFC:', 'requestVideoFrameCallback' in HTMLVideoElement.prototype);
      console.log('[DIAG] File:', s.videoFile.name, (s.videoFile.size / 1024 / 1024).toFixed(1) + 'MB', s.videoFile.type);
      console.log('[DIAG] Trim:', s.trimStart.toFixed(1) + 's →', s.trimEnd.toFixed(1) + 's (' + (s.trimEnd - s.trimStart).toFixed(1) + 's)');
      if (performance.memory) {
        const m = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        console.log('[DIAG] Memory:', (m.usedJSHeapSize / 1024 / 1024).toFixed(0) + 'MB /', (m.jsHeapSizeLimit / 1024 / 1024).toFixed(0) + 'MB');
      }

      if (!supportsWebCodecs) {
        throw new Error('Ton navigateur ne supporte pas l\'export video. Utilise Safari 17+ ou Chrome.');
      }

      console.log('[DIAG] Loading fonts...');
      for (const o of s.overlays) await loadFont(o.fontFamily);
      if (s.subtitleFontFamily && s.subtitleFontFamily !== 'Inter') await loadFont(s.subtitleFontFamily);
      console.log('[DIAG] Fonts OK. Starting export...');
      const filterCss = FILTERS.find(f => f.id === s.filter)?.css ?? 'none';

      setState('exporting');

      // Construire le SceneGraph — template ou overlays existants
      const scene = buildExportScene({
        duration: s.trimEnd - s.trimStart,
        overlays: s.overlays,
        subtitles: s.subtitles,
        templateId: s.activeTemplateId ?? undefined,
        templateConfig: s.activeTemplateId ? {
          title: s.templateTitle, points: s.templatePoints,
          quote: s.templateQuote, cta: s.templateCta, duration: s.trimEnd - s.trimStart,
        } : undefined,
      });

      const blob = await exportWithWebCodecs(
        s.videoFile, s.trimStart, s.trimEnd, setProgress,
        filterCss, s.overlays, s.subtitles, s.subtitleStyle, scene, s.activeLutId,
        s.subtitleFamily, s.subtitlePosition, s.subtitleAnimation, s.subtitleAccentColor,
        s.subtitleOverrides, s.subtitleFontFamily,
      );

      // Upload resumable avec progression
      console.log('[DIAG] Export blob:', (blob.size / 1024 / 1024).toFixed(1) + 'MB');
      setState('uploading');
      const userId = getFirebaseAuth().currentUser?.uid;
      console.log('[DIAG] Uploading as user:', userId?.slice(0, 8) + '...');
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
      console.error('[DIAG] EXPORT FAILED:', err);
      console.error('[DIAG] Error type:', err?.constructor?.name, '| message:', err instanceof Error ? err.message : String(err));
      if (err instanceof Error && err.stack) console.error('[DIAG] Stack:', err.stack);
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
  }, [supportsWebCodecs]);

  return { exportVideo, state, progress, error, supportsWebCodecs };
}
