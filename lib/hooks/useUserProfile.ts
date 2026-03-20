'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';

/** Lit le profil utilisateur (users/{uid}) pour les categories custom */
export function useUserProfile() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseFirestore();
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const data = snap.data();
      setCustomCategories(data?.customCategories || []);
    });
    return unsub;
  }, [uid]);

  const updateCustomCategories = async (cats: string[]) => {
    if (!uid) return;
    const db = getFirebaseFirestore();
    await setDoc(doc(db, 'users', uid), { customCategories: cats }, { merge: true });
  };

  return { customCategories, updateCustomCategories };
}
