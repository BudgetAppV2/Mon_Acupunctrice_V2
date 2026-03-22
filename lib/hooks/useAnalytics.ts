'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { ContentItem } from '@/lib/types';

interface InsightsSummary {
  totalPlays: number;
  totalReach: number;
  totalEngagement: number;
  publishCount: number;
}

interface DailyEntry {
  date: string;
  followerCount: number;
  reach: number;
}

/** Résumé des insights des 30 derniers jours */
export function useInsightsSummary(): InsightsSummary & { loading: boolean } {
  const uid = useAuthStore((s) => s.user?.uid);
  const [data, setData] = useState<InsightsSummary>({ totalPlays: 0, totalReach: 0, totalEngagement: 0, publishCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const db = getFirebaseFirestore();
    const q = query(collection(db, 'contentItems'), where('userId', '==', uid), where('distributionStatus', '==', 'published'), orderBy('publishedAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      let plays = 0, reach = 0, engagement = 0, count = 0;
      snap.docs.forEach(doc => {
        const item = doc.data() as ContentItem;
        if (item.insights) {
          plays += item.insights.plays || 0;
          reach += item.insights.reach || 0;
          engagement += (item.insights.likes || 0) + (item.insights.comments || 0) + (item.insights.shares || 0) + (item.insights.saved || 0);
          count++;
        }
      });
      setData({ totalPlays: plays, totalReach: reach, totalEngagement: engagement, publishCount: count });
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { ...data, loading };
}

/** Données quotidiennes (followers, reach) des N derniers jours */
export function useDailyAnalytics(days = 30): { data: DailyEntry[]; loading: boolean } {
  const uid = useAuthStore((s) => s.user?.uid);
  const [data, setData] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const db = getFirebaseFirestore();
    const q = query(collection(db, `analytics/${uid}/daily`), orderBy('date', 'desc'), limit(days));
    getDocs(q).then(snap => {
      setData(snap.docs.map(d => d.data() as DailyEntry).reverse());
    }).finally(() => setLoading(false));
  }, [uid, days]);

  return { data, loading };
}

/** Top Reels par engagement */
export function useTopReels(count = 5): { data: ContentItem[]; loading: boolean } {
  const uid = useAuthStore((s) => s.user?.uid);
  const [data, setData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const db = getFirebaseFirestore();
    const q = query(collection(db, 'contentItems'), where('userId', '==', uid), where('distributionStatus', '==', 'published'), orderBy('publishedAt', 'desc'), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ContentItem))
        .filter(i => i.insights)
        .sort((a, b) => {
          const ea = (a.insights!.likes || 0) + (a.insights!.comments || 0) + (a.insights!.shares || 0) + (a.insights!.saved || 0);
          const eb = (b.insights!.likes || 0) + (b.insights!.comments || 0) + (b.insights!.shares || 0) + (b.insights!.saved || 0);
          return eb - ea;
        })
        .slice(0, count);
      setData(items);
      setLoading(false);
    });
    return unsub;
  }, [uid, count]);

  return { data, loading };
}
