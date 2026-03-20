'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { ContentItem, WorkflowState } from '@/lib/types';

export interface ContentFilters {
  status?: WorkflowState;
  categories?: string[];
}

export function useContentItems(filters?: ContentFilters) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [data, setData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusFilter = filters?.status;
  // Sérialiser pour une dépendance stable dans useEffect
  const categoriesKey = filters?.categories?.slice().sort().join(',') ?? '';

  useEffect(() => {
    if (!uid) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirebaseFirestore();

    const constraints = [
      where('userId', '==', uid),
      ...(statusFilter ? [where('workflowState', '==', statusFilter)] : []),
      orderBy('createdAt', 'desc'),
    ];

    const q = query(collection(db, 'contentItems'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ContentItem[];

        // Filtrage catégories côté client pour éviter des index composites supplémentaires
        if (categoriesKey) {
          const cats = categoriesKey.split(',');
          items = items.filter((item) => cats.includes(item.category));
        }

        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid, statusFilter, categoriesKey]);

  return { data, loading, error };
}
