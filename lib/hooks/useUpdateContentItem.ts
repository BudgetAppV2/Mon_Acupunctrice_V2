'use client';

import { doc, getDoc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { deriveWorkflowState } from '@/lib/utils/deriveWorkflowState';
import type { ContentItem } from '@/lib/types';

export function useUpdateContentItem() {
  const uid = useAuthStore((s) => s.user?.uid);

  const updateItem = async (id: string, data: Record<string, unknown>) => {
    if (!uid) throw new Error('Non authentifié');

    const db = getFirebaseFirestore();

    // Lire l'item courant pour deriver le workflowState automatiquement
    const snap = await getDoc(doc(db, 'contentItems', id));
    const current = snap.data() || {};
    // Convertir les valeurs null en deleteField() pour Firestore
    const firestoreData: Record<string, unknown> = {};
    const mergeData: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        firestoreData[key] = deleteField();
        delete mergeData[key];
      } else {
        firestoreData[key] = value;
        mergeData[key] = value;
      }
    }

    const workflowState = deriveWorkflowState(mergeData as Partial<ContentItem>);

    await updateDoc(doc(db, 'contentItems', id), {
      ...firestoreData,
      workflowState,
      updatedAt: serverTimestamp(),
    });
  };

  return { updateItem };
}
