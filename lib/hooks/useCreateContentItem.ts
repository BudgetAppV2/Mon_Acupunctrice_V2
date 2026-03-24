'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { ContentStyle } from '@/lib/types';

interface CreateInput {
  title: string;
  category: string;
  notes?: string;
  contentStyle?: ContentStyle;
}

export function useCreateContentItem() {
  const uid = useAuthStore((s) => s.user?.uid);

  const createItem = async (input: CreateInput) => {
    if (!uid) throw new Error('Non authentifié');

    const db = getFirebaseFirestore();
    const now = serverTimestamp();

    await addDoc(collection(db, 'contentItems'), {
      userId: uid,
      title: input.title,
      category: input.category,
      notes: input.notes ?? '',
      ...(input.contentStyle ? { contentStyle: input.contentStyle } : {}),
      workflowState: 'idea',
      distributionStatus: 'draft',
      createdAt: now,
      updatedAt: now,
    });
  };

  return { createItem };
}
