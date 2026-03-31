'use client';

import { useEffect, useRef, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';

/** Auto-save V2 editor state to Firestore (debounce 2s, JSON diff) */
export function useEditorV2Persistence(itemId: string | null) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastJsonRef = useRef<string>('');

  useEffect(() => {
    if (!itemId) return;

    const unsub = useEditorV2Store.subscribe((state) => {
      const editorDataV2 = {
        globalPreset: state.globalPreset,
        blocks: state.blocks,
        textOverlays: state.textOverlays,
        filterId: state.filterId,
        filterIntensity: state.filterIntensity,
        voiceVolume: state.voiceVolume,
        audioVolume: state.audioVolume,
        audioDucking: state.audioDucking,
        coverFrameMs: state.coverFrameMs,
        coverDataUrl: state.coverDataUrl,
        // Clips serialises sans File/blobUrl (non-serialisables)
        tracks: state.tracks.map(t => {
          if (t.type === 'video' && t.clips) {
            return {
              ...t, clips: t.clips.map(c => ({
                id: c.id, duration: c.duration, trimStart: c.trimStart, trimEnd: c.trimEnd,
                timelineStart: c.timelineStart, filterId: c.filterId, sourceVideoUrl: c.sourceVideoUrl,
              })),
            };
          }
          if (t.type === 'audio' && t.audioClips) {
            return {
              ...t, audioClips: t.audioClips.map(a => ({
                id: a.id, name: a.name, duration: a.duration, startMs: a.startMs,
                volume: a.volume, fadeIn: a.fadeIn, fadeOut: a.fadeOut, audioUrl: a.audioUrl,
              })),
            };
          }
          return t;
        }),
      };

      const json = JSON.stringify(editorDataV2);
      if (json === lastJsonRef.current) return;
      lastJsonRef.current = json;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          const db = getFirebaseFirestore();
          await updateDoc(doc(db, 'contentItems', itemId), {
            editorDataV2: { ...editorDataV2, savedAt: serverTimestamp() },
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } catch { /* sauvegarde echouee — non bloquant */ }
        finally { setSaving(false); }
      }, 2000);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [itemId]);

  return { saving, saved };
}
