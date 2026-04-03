'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { ContentItem } from '@/lib/types';

interface InsightsSummary {
  totalPlays: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaved: number;
  totalEngagement: number;
  publishCount: number;
  trends: { plays: number; reach: number; engagement: number };
}

interface DailyEntry {
  date: string;
  followerCount: number;
  reach: number;
}

function sumInsights(items: ContentItem[], cutoff: number, end: number) {
  let plays = 0, reach = 0, likes = 0, comments = 0, shares = 0, saved = 0;
  for (const item of items) {
    if (!item.insights) continue;
    const pub = item.publishedAt && 'toMillis' in item.publishedAt ? item.publishedAt.toMillis() : 0;
    if (pub < cutoff || pub > end) continue;
    plays += item.insights.plays || 0;
    reach += item.insights.reach || 0;
    likes += item.insights.likes || 0;
    comments += item.insights.comments || 0;
    shares += item.insights.shares || 0;
    saved += item.insights.saved || 0;
  }
  const engagement = likes + comments + shares + saved;
  return { plays, reach, likes, comments, shares, saved, engagement };
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Insights summary with period filter and trends */
export function useInsightsSummary(days = 30): InsightsSummary & { loading: boolean } {
  const uid = useAuthStore((s) => s.user?.uid);
  const [data, setData] = useState<InsightsSummary>({
    totalPlays: 0, totalReach: 0, totalLikes: 0, totalComments: 0,
    totalShares: 0, totalSaved: 0, totalEngagement: 0, publishCount: 0,
    trends: { plays: 0, reach: 0, engagement: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const db = getFirebaseFirestore();
    // Fetch enough items to cover current + previous period
    const q = query(collection(db, 'contentItems'), where('userId', '==', uid), where('distributionStatus', '==', 'published'), orderBy('publishedAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentItem));
      const now = Date.now();
      const periodStart = now - days * 86400 * 1000;
      const prevStart = periodStart - days * 86400 * 1000;

      const current = sumInsights(items, periodStart, now);
      const previous = sumInsights(items, prevStart, periodStart);
      const count = items.filter(i => {
        if (!i.insights || !i.publishedAt) return false;
        const pub = 'toMillis' in i.publishedAt ? i.publishedAt.toMillis() : 0;
        return pub >= periodStart && pub <= now;
      }).length;

      setData({
        totalPlays: current.plays, totalReach: current.reach,
        totalLikes: current.likes, totalComments: current.comments,
        totalShares: current.shares, totalSaved: current.saved,
        totalEngagement: current.engagement, publishCount: count,
        trends: {
          plays: pctChange(current.plays, previous.plays),
          reach: pctChange(current.reach, previous.reach),
          engagement: pctChange(current.engagement, previous.engagement),
        },
      });
      setLoading(false);
    });
    return unsub;
  }, [uid, days]);

  return { ...data, loading };
}

/** Daily account metrics (followers, reach) */
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

export type SortBy = 'date' | 'views' | 'engagement';

function getEngagement(item: ContentItem): number {
  if (!item.insights) return 0;
  return (item.insights.likes || 0) + (item.insights.comments || 0) + (item.insights.shares || 0) + (item.insights.saved || 0);
}

/** Published items filtered by period with client-side sort */
export function usePublishedItems(days = 30, sortBy: SortBy = 'date'): { data: ContentItem[]; loading: boolean } {
  const uid = useAuthStore((s) => s.user?.uid);
  const [data, setData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const db = getFirebaseFirestore();
    const q = query(collection(db, 'contentItems'), where('userId', '==', uid), where('distributionStatus', '==', 'published'), orderBy('publishedAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const cutoff = now - days * 86400 * 1000;
      let items = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ContentItem))
        .filter(i => {
          if (!i.publishedAt) return false;
          const pub = 'toMillis' in i.publishedAt ? i.publishedAt.toMillis() : 0;
          return pub >= cutoff;
        });
      // Client-side sort
      if (sortBy === 'views') {
        items.sort((a, b) => (b.insights?.plays || 0) - (a.insights?.plays || 0));
      } else if (sortBy === 'engagement') {
        items.sort((a, b) => getEngagement(b) - getEngagement(a));
      }
      // 'date' is already desc from Firestore orderBy
      setData(items);
      setLoading(false);
    });
    return unsub;
  }, [uid, days, sortBy]);

  return { data, loading };
}

/** Top Reels by engagement */
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
