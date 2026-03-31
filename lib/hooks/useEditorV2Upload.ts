'use client';

import { useEffect, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';

/** Uploads new video/audio files to Firebase Storage in background */
export function useEditorV2Upload(itemId: string | null) {
  const uploadingRef = useRef(new Set<string>());

  useEffect(() => {
    if (!itemId) return;

    const unsub = useEditorV2Store.subscribe((state) => {
      const userId = getFirebaseAuth().currentUser?.uid;
      if (!userId) return;

      // Upload video clips that have a file but no sourceVideoUrl
      for (const t of state.tracks) {
        if (t.type === 'video' && t.clips) {
          for (const c of t.clips) {
            if (c.file && !c.sourceVideoUrl && !uploadingRef.current.has(c.id)) {
              uploadingRef.current.add(c.id);
              uploadFile(
                c.file,
                `editor-v2/${userId}/${itemId}/source_${c.id}.mp4`,
                (url) => useEditorV2Store.getState().setClipSourceUrl(c.id, url),
                () => uploadingRef.current.delete(c.id),
              );
            }
          }
        }
        if (t.type === 'audio' && t.audioClips) {
          for (const a of t.audioClips) {
            if (a.file && !a.audioUrl && !uploadingRef.current.has(a.id)) {
              uploadingRef.current.add(a.id);
              uploadFile(
                a.file,
                `editor-v2/${userId}/${itemId}/audio_${a.id}.mp3`,
                (url) => useEditorV2Store.getState().setAudioClipUrl(a.id, url),
                () => uploadingRef.current.delete(a.id),
              );
            }
          }
        }
      }
    });

    return () => { unsub(); };
  }, [itemId]);
}

async function uploadFile(
  file: File,
  storagePath: string,
  onUrl: (url: string) => void,
  onDone: () => void,
) {
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file);
    await new Promise<void>((resolve, reject) => {
      task.on('state_changed', null, reject, async () => {
        try {
          const url = await getDownloadURL(storageRef);
          onUrl(url);
          resolve();
        } catch (err) { reject(err); }
      });
    });
  } catch { /* upload failed — non-blocking, will retry on next state change */ }
  finally { onDone(); }
}
