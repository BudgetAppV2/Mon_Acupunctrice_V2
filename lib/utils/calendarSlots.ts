import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import type { CalendarSlot, WeekPattern } from '@/lib/types';

// Phase 1 : alternance enseigner+connecter (semaines impaires) / aider+inspirer (semaines paires)
const PHASE_1_PATTERNS: [WeekPattern[], WeekPattern[]] = [
  [
    { dayOfWeek: 2, contentStyle: 'enseigner', format: 'reel' }, // Mardi
    { dayOfWeek: 5, contentStyle: 'connecter', format: 'reel' }, // Vendredi
  ],
  [
    { dayOfWeek: 2, contentStyle: 'aider', format: 'reel' },    // Mardi
    { dayOfWeek: 5, contentStyle: 'inspirer', format: 'reel' }, // Vendredi
  ],
];

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Crée 2 slots pour la semaine débutant un lundi. Anti-doublons : ne fait rien si les slots existent déjà.
export async function generateWeekSlots(
  userId: string,
  weekStartMonday: Date,
  phase = 1,
): Promise<CalendarSlot[]> {
  const db = getFirebaseFirestore();
  const weekEnd = new Date(weekStartMonday);
  weekEnd.setDate(weekStartMonday.getDate() + 7);

  const existingSnap = await getDocs(
    query(
      collection(db, 'calendarSlots'),
      where('userId', '==', userId),
      where('scheduledDate', '>=', Timestamp.fromDate(weekStartMonday)),
      where('scheduledDate', '<', Timestamp.fromDate(weekEnd)),
    ),
  );
  // Vérifier par jour et par pattern, pas juste "la semaine a des slots"
  const existingDays = new Set(
    existingSnap.docs.map((d) => {
      const dt = d.data().scheduledDate.toDate();
      return dt.getDay(); // 0-6
    }),
  );

  const weekNum = isoWeekNumber(weekStartMonday);
  const patterns = PHASE_1_PATTERNS[weekNum % 2];
  const batch = writeBatch(db);
  const created: CalendarSlot[] = [];

  for (const pattern of patterns) {
    // Skip si un slot existe déjà pour ce jour de la semaine
    if (existingDays.has(pattern.dayOfWeek)) continue;

    const slotDate = new Date(weekStartMonday);
    slotDate.setDate(weekStartMonday.getDate() + (pattern.dayOfWeek - 1));
    slotDate.setHours(18, 0, 0, 0);

    const ref = doc(collection(db, 'calendarSlots'));
    const now = Timestamp.now();
    const localData: Omit<CalendarSlot, 'id'> = {
      userId,
      scheduledDate: Timestamp.fromDate(slotDate),
      dayOfWeek: pattern.dayOfWeek,
      contentStyle: pattern.contentStyle,
      format: pattern.format,
      status: 'open',
      weekNumber: weekNum,
      planPhase: phase,
      createdAt: now,
      updatedAt: now,
    };

    batch.set(ref, {
      ...localData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    created.push({ id: ref.id, ...localData });
  }

  if (created.length > 0) await batch.commit();
  return created;
}
