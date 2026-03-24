'use client';

import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { ProgressData } from '@/lib/types';
import { MILESTONES, type MilestoneDefinition } from '@/lib/data/milestones';

/** Calcule la semaine ISO courante en heure de Montreal */
function getCurrentWeek(): string {
  const now = new Date();
  const mtl = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
  const jan1 = new Date(mtl.getFullYear(), 0, 1);
  const days = Math.floor((mtl.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${mtl.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getPreviousWeek(week: string): string {
  const [year, w] = week.split('-W').map(Number);
  if (w === 1) return `${year - 1}-W52`;
  return `${year}-W${String(w - 1).padStart(2, '0')}`;
}

const DEFAULT_PROGRESS: ProgressData = {
  currentStreak: 0,
  longestStreak: 0,
  totalPublished: 0,
  milestonesUnlocked: [],
  lastActiveWeek: '',
  pendingMilestoneToasts: [],
};

export function useProgression() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const db = getFirebaseFirestore();
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const data = snap.data();
      setProgressData(data?.progressData ?? DEFAULT_PROGRESS);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  /** Appele apres chaque publication reussie cote client */
  const updateProgression = useCallback(async () => {
    if (!uid) return;
    const prev = progressData ?? DEFAULT_PROGRESS;
    const currentWeek = getCurrentWeek();

    // Calcul de la serie
    let newStreak = prev.currentStreak;
    if (prev.lastActiveWeek !== currentWeek) {
      const prevWeek = getPreviousWeek(currentWeek);
      if (prev.lastActiveWeek === prevWeek) {
        newStreak = prev.currentStreak + 1;
      } else {
        // Semaine manquee ou premiere fois : serie repart sans message negatif
        newStreak = 1;
      }
    }
    const newLongest = Math.max(prev.longestStreak, newStreak);
    const newTotal = prev.totalPublished + 1;

    // Debloquage des jalons
    const newUnlocked = [...prev.milestonesUnlocked];
    const newToasts = [...prev.pendingMilestoneToasts];
    for (const m of MILESTONES) {
      if (!newUnlocked.includes(m.id) && m.check({ totalPublished: newTotal, currentStreak: newStreak })) {
        newUnlocked.push(m.id);
        newToasts.push(m.id);
      }
    }

    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'users', uid), {
      'progressData.totalPublished': increment(1),
      'progressData.currentStreak': newStreak,
      'progressData.longestStreak': newLongest,
      'progressData.lastActiveWeek': currentWeek,
      'progressData.milestonesUnlocked': newUnlocked,
      'progressData.pendingMilestoneToasts': newToasts,
    });
  }, [uid, progressData]);

  /** Retire le premier toast en attente apres affichage */
  const consumeToast = useCallback(async () => {
    if (!uid || !progressData?.pendingMilestoneToasts.length) return;
    const db = getFirebaseFirestore();
    await updateDoc(doc(db, 'users', uid), {
      'progressData.pendingMilestoneToasts': progressData.pendingMilestoneToasts.slice(1),
    });
  }, [uid, progressData]);

  // Premier jalon en attente, avec sa definition complete
  const pendingToastId = progressData?.pendingMilestoneToasts[0] ?? null;
  const pendingToast: MilestoneDefinition | null = pendingToastId
    ? (MILESTONES.find(m => m.id === pendingToastId) ?? null)
    : null;

  return { progressData, updateProgression, pendingToast, consumeToast, loading };
}
