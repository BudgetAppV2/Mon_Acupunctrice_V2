'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import type { CalendarSlot } from '@/lib/types';

/** Hook minimal pour lire les CalendarSlots d'un mois donné. */
export function useCalendarSlots(month: number, year: number) {
  const { user } = useAuth();
  const [slotsByDay, setSlotsByDay] = useState<Map<string, CalendarSlot[]>>(new Map());

  useEffect(() => {
    if (!user) return;

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    const db = getFirebaseFirestore();

    const q = query(
      collection(db, 'calendarSlots'),
      where('userId', '==', user.uid),
      where('scheduledDate', '>=', Timestamp.fromDate(start)),
      where('scheduledDate', '<', Timestamp.fromDate(end)),
    );

    const unsub = onSnapshot(q, (snap) => {
      const map = new Map<string, CalendarSlot[]>();
      snap.forEach((doc) => {
        const slot = { id: doc.id, ...doc.data() } as CalendarSlot;
        const d = slot.scheduledDate.toDate();
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const existing = map.get(key) ?? [];
        map.set(key, [...existing, slot]);
      });
      setSlotsByDay(map);
    });

    return unsub;
  }, [user, month, year]);

  return { slotsByDay };
}
