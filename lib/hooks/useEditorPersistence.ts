'use client';

import { useEffect, useRef, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useEditorStore } from '@/lib/store/useEditorStore';

function buildEditorData(state: ReturnType<typeof useEditorStore.getState>) {
  return {
    trimStart: state.trimStart,
    trimEnd: state.trimEnd,
    overlays: state.overlays,
    subtitles: state.subtitles,
    subtitleStyle: state.subtitleStyle,
    subtitleFamily: state.subtitleFamily,
    subtitlePosition: state.subtitlePosition,
    subtitleAnimation: state.subtitleAnimation,
    subtitleAccentColor: state.subtitleAccentColor,
    subtitleFontFamily: state.subtitleFontFamily,
    subtitleOverrides: state.subtitleOverrides,
    subtitlePresetId: state.subtitlePresetId,
    filter: state.filter,
    activeLutId: state.activeLutId,
    activeThemeId: state.activeThemeId,
    audioUrl: state.audioUrl,
    audioName: state.audioName,
    voiceVolume: state.voiceVolume,
    audioVolume: state.audioVolume,
    audioFadeIn: state.audioFadeIn,
    audioFadeOut: state.audioFadeOut,
    audioDucking: state.audioDucking,
    coverFrameOffset: state.coverFrameOffset,
    coverCustomUrl: state.coverCustomUrl,
    // Clips serialisés sans File/blobUrl (non-serialisables)
    clips: state.clips.map(c => ({
      id: c.id, duration: c.duration, trimStart: c.trimStart, trimEnd: c.trimEnd,
      timelineStart: c.timelineStart, sourceVideoUrl: c.sourceVideoUrl,
    })),
  };
}

/** Sauvegarde automatique des données éditables dans Firestore (debounce 500ms + flush immédiat au démontage) */
export function useEditorPersistence(itemId: string | null) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastJsonRef = useRef<string>('');
  const pendingDataRef = useRef<ReturnType<typeof buildEditorData> | null>(null);

  useEffect(() => {
    if (!itemId) return;

    const unsub = useEditorStore.subscribe((state) => {
      const editorData = buildEditorData(state);

      // Comparaison shallow pour éviter les écritures inutiles
      const json = JSON.stringify(editorData);
      if (json === lastJsonRef.current) return;
      lastJsonRef.current = json;
      pendingDataRef.current = editorData;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        pendingDataRef.current = null;
        try {
          setSaving(true);
          const db = getFirebaseFirestore();
          await updateDoc(doc(db, 'contentItems', itemId), {
            editorData: { ...editorData, savedAt: serverTimestamp() },
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } catch (e) { const msg = e instanceof Error ? e.message : String(e); setSaveError(msg); setTimeout(() => setSaveError(null), 8000); }
        finally { setSaving(false); }
      }, 500);
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
      // Flush immédiat si des changements sont en attente (évite la perte lors de la navigation)
      const pending = pendingDataRef.current;
      if (pending) {
        pendingDataRef.current = null;
        const db = getFirebaseFirestore();
        updateDoc(doc(db, 'contentItems', itemId), {
          editorData: { ...pending, savedAt: serverTimestamp() },
        }).catch(() => {});
      }
    };
  }, [itemId]);

  return { saving, saved, saveError };
}
