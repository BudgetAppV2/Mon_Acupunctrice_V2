'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { CalendarSlot } from '@/lib/types';

export function useCalendarSlots(month: number, year: number) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const monthKey = `${year}-${month}`;

  useEffect(() => {
    if (!uid) { setSlots([]); setLoading(false); return; }

    setLoading(true);
    const db = getFirebaseFirestore();
    const start = Timestamp.fromDate(new Date(year, month, 1));
    const end = Timestamp.fromDate(new Date(year, month + 1, 0, 23, 59, 59));

    const q = query(
      collection(db, 'calendarSlots'),
      where('userId', '==', uid),
      where('scheduledDate', '>=', start),
      where('scheduledDate', '<=', end),
    );

    const unsub = onSnapshot(q, (snap) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTs = Timestamp.fromDate(today);

      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarSlot));

      // Auto-skip les slots passés encore ouverts
      for (const slot of items) {
        if (slot.status === 'open' && slot.scheduledDate < todayTs) {
          updateDoc(doc(db, 'calendarSlots', slot.id), {
            status: 'skipped',
            updatedAt: serverTimestamp(),
          });
        }
      }

      setSlots(items);
      setLoading(false);
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, monthKey]);

  // Grouper par clé "YYYY-M-D" (même format que useCalendar)
  const slotsByDay = useMemo(() => {
    const map = new Map<string, CalendarSlot[]>();
    for (const slot of slots) {
      const d = slot.scheduledDate.toDate();
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }
    return map;
  }, [slots]);

  return { slots, slotsByDay, loading };
}
