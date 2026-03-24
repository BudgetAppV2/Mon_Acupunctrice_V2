'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { ContentItem } from '@/lib/types';

export function useCalendar() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [scheduledItems, setScheduledItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goToNextMonth = () =>
    setCurrentMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  const goToPreviousMonth = () =>
    setCurrentMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));

  const calendarDays = useMemo(
    () => generateDays(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth],
  );

  // Sérialiser pour une dépendance useEffect stable
  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

  useEffect(() => {
    if (!uid) { setScheduledItems([]); setLoading(false); return; }

    setLoading(true);
    const db = getFirebaseFirestore();
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();

    const q = query(
      collection(db, 'contentItems'),
      where('userId', '==', uid),
      where('scheduledAt', '>=', Timestamp.fromDate(new Date(y, m, 1))),
      where('scheduledAt', '<=', Timestamp.fromDate(new Date(y, m + 1, 0, 23, 59, 59))),
      orderBy('scheduledAt', 'asc'),
    );

    const unsub = onSnapshot(q,
      (snap) => {
        setScheduledItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem)));
        setLoading(false);
        setError(null);
      },
      (err) => { setError(err.message); setLoading(false); },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, monthKey]);

  // Grouper les items par jour pour lookup O(1) dans CalendarDay
  const itemsByDay = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const item of scheduledItems) {
      if (!item.scheduledAt) continue;
      const d = item.scheduledAt.toDate();
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }, [scheduledItems]);

  return { currentMonth, calendarDays, itemsByDay, scheduledItems, loading, error, goToNextMonth, goToPreviousMonth };
}

// Génère 42 jours (6 semaines) en commençant par lundi
function generateDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  let offset = first.getDay() - 1; // lundi = 0
  if (offset < 0) offset = 6;      // dimanche → 6

  const days: Date[] = [];
  for (let i = offset; i > 0; i--) days.push(new Date(year, month, 1 - i));
  const total = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= total; i++) days.push(new Date(year, month, i));
  let next = 1;
  while (days.length < 42) days.push(new Date(year, month + 1, next++));
  return days;
}
