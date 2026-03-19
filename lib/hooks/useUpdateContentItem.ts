'use client';

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function useUpdateContentItem() {
  const uid = useAuthStore((s) => s.user?.uid);

  const updateItem = async (id: string, data: Record<string, unknown>) => {
    if (!uid) throw new Error('Non authentifié');

    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'contentItems', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  return { updateItem };
}
