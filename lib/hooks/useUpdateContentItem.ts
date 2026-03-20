'use client';

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
    const merged = { ...current, ...data };
    const workflowState = deriveWorkflowState(merged as Partial<ContentItem>);

    await updateDoc(doc(db, 'contentItems', id), {
      ...data,
      workflowState,
      updatedAt: serverTimestamp(),
    });
  };

  return { updateItem };
}
