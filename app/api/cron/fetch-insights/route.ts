import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

const GRAPH = 'https://graph.instagram.com/v25.0';

async function fetchMediaInsights(
  mediaId: string, token: string,
): Promise<Record<string, number>> {
  const res = await fetch(
    `${GRAPH}/${mediaId}/insights?metric=views,reach,likes,comments,shares,saved,total_interactions&access_token=${token}`,
  );
  if (!res.ok) return {};
  const json = await res.json();
  const metrics: Record<string, number> = {};
  for (const entry of json.data || []) {
    metrics[entry.name] = entry.values?.[0]?.value ?? 0;
  }
  // Map views → plays for backward compatibility with existing hooks/UI
  if (metrics.views !== undefined && metrics.plays === undefined) {
    metrics.plays = metrics.views;
  }
  return metrics;
}

async function fetchAccountInsights(
  igId: string, token: string,
): Promise<{ followerCount: number; reach: number }> {
  const now = Math.floor(Date.now() / 1000);
  const yesterday = now - 86400;
  const res = await fetch(
    `${GRAPH}/${igId}/insights?metric=follower_count,reach&period=day&since=${yesterday}&until=${now}&access_token=${token}`,
  );
  if (!res.ok) return { followerCount: 0, reach: 0 };
  const json = await res.json();
  let followerCount = 0, reach = 0;
  for (const entry of json.data || []) {
    const val = entry.values?.[entry.values.length - 1]?.value ?? 0;
    if (entry.name === 'follower_count') followerCount = val;
    if (entry.name === 'reach') reach = val;
  }
  return { followerCount, reach };
}

/** GET /api/cron/fetch-insights — Récupère les stats Instagram et les stocke */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminFirestore();
  let processed = 0, errors = 0;

  // Trouver les users avec Instagram connecté
  const usersSnap = await db.collection('users').where('metaStatus', '==', 'connected').get();

  for (const userDoc of usersSnap.docs) {
    try {
      const userData = userDoc.data();
      const uid = userDoc.id;
      const igId = userData.metaInstagramId;
      const tokensSnap = await db.doc(`users/${uid}/private/tokens`).get();
      const token = tokensSnap.data()?.metaAccessToken;
      if (!token || !igId) continue;

      // Items publiés < 30 jours avec instagramPostId
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000);
      const itemsSnap = await db.collection('contentItems')
        .where('userId', '==', uid)
        .where('distributionStatus', '==', 'published')
        .where('publishedAt', '>=', thirtyDaysAgo)
        .limit(50)
        .get();

      // Insights par media
      for (const itemDoc of itemsSnap.docs) {
        const item = itemDoc.data();
        if (!item.instagramPostId) continue;
        try {
          const metrics = await fetchMediaInsights(item.instagramPostId, token);
          if (Object.keys(metrics).length > 0) {
            await db.doc(`contentItems/${itemDoc.id}`).update({
              insights: { ...metrics, fetchedAt: new Date() },
            });
          }
        } catch { /* skip individual media errors */ }
      }

      // Insights compte
      try {
        const account = await fetchAccountInsights(igId, token);
        const dateStr = new Date().toISOString().split('T')[0];
        await db.doc(`analytics/${uid}/daily/${dateStr}`).set({
          followerCount: account.followerCount,
          reach: account.reach,
          date: dateStr,
          fetchedAt: new Date(),
        });
      } catch { /* skip account insights errors */ }

      processed++;
    } catch { errors++; }
  }

  return NextResponse.json({ processed, errors });
}
