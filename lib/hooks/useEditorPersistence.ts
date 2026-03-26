'use client';

import { useEffect, useRef, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useEditorStore } from '@/lib/store/useEditorStore';

/** Sauvegarde automatique des donnees editables dans Firestore (debounce 2s) */
export function useEditorPersistence(itemId: string | null) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastJsonRef = useRef<string>('');

  useEffect(() => {
    if (!itemId) return;

    const unsub = useEditorStore.subscribe((state) => {
      const editorData = {
        trimStart: state.trimStart,
        trimEnd: state.trimEnd,
        overlays: state.overlays,
        subtitles: state.subtitles,
        subtitleStyle: state.subtitleStyle,
        filter: state.filter,
        audioUrl: state.audioUrl,
        audioName: state.audioName,
        voiceVolume: state.voiceVolume,
        audioVolume: state.audioVolume,
        audioFadeIn: state.audioFadeIn,
        audioFadeOut: state.audioFadeOut,
        coverFrameOffset: state.coverFrameOffset,
        coverCustomUrl: state.coverCustomUrl,
      };

      // Comparaison shallow pour eviter les ecritures inutiles
      const json = JSON.stringify(editorData);
      if (json === lastJsonRef.current) return;
      lastJsonRef.current = json;

      // Debounce 2 secondes
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          const db = getFirebaseFirestore();
          await updateDoc(doc(db, 'contentItems', itemId), {
            editorData: { ...editorData, savedAt: serverTimestamp() },
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
