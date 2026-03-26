'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseStorage, getFirebaseFirestore, getFirebaseAuth } from '@/lib/firebase';
import { deriveWorkflowState } from '@/lib/utils/deriveWorkflowState';

/** Upload la video source vers Storage en arriere-plan apres import/enregistrement */
export function useVideoSourceUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadSource = useCallback(async (file: File, itemId: string) => {
    const userId = getFirebaseAuth().currentUser?.uid;
    if (!userId || !itemId) return;

    setUploading(true);
    setProgress(0);

    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `videos/${userId}/${itemId}/source.mp4`);

      const sourceVideoUrl = await new Promise<string>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file);
        task.on('state_changed',
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => { resolve(await getDownloadURL(storageRef)); },
        );
      });

      // Sauvegarder dans Firestore
      const db = getFirebaseFirestore();
      const docRef = doc(db, 'contentItems', itemId);
      await updateDoc(docRef, {
        sourceVideoUrl,
        workflowState: deriveWorkflowState({ sourceVideoUrl }),
        updatedAt: serverTimestamp(),
      });
    } catch { /* upload echoue — non bloquant, l'editeur fonctionne quand meme */ }
    finally { setUploading(false); setProgress(0); }
  }, []);

  return { uploadSource, uploading, progress };
}
