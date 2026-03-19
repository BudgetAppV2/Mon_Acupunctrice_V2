'use client';

import { doc, deleteDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';

export function useDeleteContentItem() {
  const uid = useAuthStore((s) => s.user?.uid);

  const deleteItem = async (id: string) => {
    if (!uid) throw new Error('Non authentifié');

    const db = getFirebaseFirestore();
    await deleteDoc(doc(db, 'contentItems', id));
  };

  return { deleteItem };
}
