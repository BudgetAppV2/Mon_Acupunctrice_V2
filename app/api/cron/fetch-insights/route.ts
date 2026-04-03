import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

const GRAPH_IG = 'https://graph.instagram.com/v25.0';
const GRAPH_FB = 'https://graph.facebook.com/v25.0';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// --- Instagram ---

async function fetchMediaInsights(
  mediaId: string, token: string,
): Promise<Record<string, number>> {
  const res = await fetch(
    `${GRAPH_IG}/${mediaId}/insights?metric=views,reach,likes,comments,shares,saved,total_interactions&access_token=${token}`,
  );
  if (!res.ok) return {};
  const json = await res.json();
  const metrics: Record<string, number> = {};
  for (const entry of json.data || []) {
    metrics[entry.name] = entry.values?.[0]?.value ?? 0;
  }
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
    `${GRAPH_IG}/${igId}/insights?metric=follower_count,reach&period=day&since=${yesterday}&until=${now}&access_token=${token}`,
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

// --- Facebook ---

async function fetchFacebookInsights(
  videoId: string, pageToken: string,
): Promise<{ views: number }> {
  try {
    const res = await fetch(`${GRAPH_FB}/${videoId}?fields=views&access_token=${pageToken}`);
    if (!res.ok) return { views: 0 };
    const json = await res.json() as { views?: number };
    return { views: json.views ?? 0 };
  } catch { return { views: 0 }; }
}

// --- YouTube ---

async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken, client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token',
      }),
    });
    const data = await res.json() as { access_token?: string };
    return data.access_token || null;
  } catch { return null; }
}

async function fetchYouTubeInsights(
  videoId: string, accessToken: string,
): Promise<{ views: number; likes: number; comments: number }> {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&access_token=${accessToken}`);
    if (!res.ok) return { views: 0, likes: 0, comments: 0 };
    const json = await res.json() as { items?: { statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }[] };
    const stats = json.items?.[0]?.statistics;
    if (!stats) return { views: 0, likes: 0, comments: 0 };
    return {
      views: parseInt(stats.viewCount || '0', 10),
      likes: parseInt(stats.likeCount || '0', 10),
      comments: parseInt(stats.commentCount || '0', 10),
    };
  } catch { return { views: 0, likes: 0, comments: 0 }; }
}

// --- Cron handler ---

/** GET /api/cron/fetch-insights — Fetch Instagram + Facebook + YouTube stats */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminFirestore();
  let processed = 0, errors = 0;

  const usersSnap = await db.collection('users').where('metaStatus', '==', 'connected').get();

  for (const userDoc of usersSnap.docs) {
    try {
      const userData = userDoc.data();
      const uid = userDoc.id;
      const igId = userData.metaInstagramId;
      const tokensSnap = await db.doc(`users/${uid}/private/tokens`).get();
      const tokensData = tokensSnap.data() || {};
      const igToken = tokensData.metaAccessToken;
      const fbPageToken = tokensData.facebookPageAccessToken;
      const ytRefreshToken = tokensData.youtubeRefreshToken;
      if (!igToken || !igId) continue;

      // Refresh YouTube access token once per user (if available)
      let ytAccessToken: string | null = null;
      if (ytRefreshToken) {
        ytAccessToken = await refreshGoogleToken(ytRefreshToken);
        if (!ytAccessToken) console.log('[CRON] YT refresh failed for user:', uid);
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000);
      const itemsSnap = await db.collection('contentItems')
        .where('userId', '==', uid)
        .where('distributionStatus', '==', 'published')
        .where('publishedAt', '>=', thirtyDaysAgo)
        .limit(50)
        .get();

      console.log('[CRON] processing user:', uid, 'items:', itemsSnap.size);

      for (const itemDoc of itemsSnap.docs) {
        const item = itemDoc.data();
        const insightsUpdate: Record<string, unknown> = {};

        // Instagram
        if (item.instagramPostId) {
          try {
            const igMetrics = await fetchMediaInsights(item.instagramPostId, igToken);
            if (Object.keys(igMetrics).length > 0) Object.assign(insightsUpdate, igMetrics);
          } catch { /* skip IG error */ }
        }

        // Facebook — use facebookVideoId (the actual video ID), fallback to facebookPostId
        const fbVideoId = item.facebookVideoId || item.facebookPostId;
        if (fbVideoId && fbPageToken) {
          try {
            const fb = await fetchFacebookInsights(fbVideoId, fbPageToken);
            if (fb.views > 0) insightsUpdate.facebookViews = fb.views;
          } catch { /* skip FB error */ }
        }

        // YouTube
        if (item.youtubeVideoId && ytAccessToken) {
          try {
            const yt = await fetchYouTubeInsights(item.youtubeVideoId, ytAccessToken);
            if (yt.views > 0) insightsUpdate.youtubeViews = yt.views;
            if (yt.likes > 0) insightsUpdate.youtubeLikes = yt.likes;
            if (yt.comments > 0) insightsUpdate.youtubeComments = yt.comments;
          } catch { /* skip YT error */ }
        }

        // Fetch Instagram comments
        let igComments: { id: string; text: string; username: string; timestamp: string }[] | null = null;
        if (item.instagramPostId) {
          try {
            const cmRes = await fetch(`${GRAPH_IG}/${item.instagramPostId}/comments?fields=id,text,username,timestamp&limit=50&access_token=${igToken}`);
            if (cmRes.ok) {
              const cmJson = await cmRes.json() as { data?: { id: string; text: string; username: string; timestamp: string }[] };
              if (cmJson.data && cmJson.data.length > 0) igComments = cmJson.data;
            }
          } catch { /* skip comments error — scope may not be granted yet */ }
        }

        // Write merged insights + comments
        if (Object.keys(insightsUpdate).length > 0 || igComments) {
          const update: Record<string, unknown> = {};
          if (Object.keys(insightsUpdate).length > 0) update.insights = { ...insightsUpdate, fetchedAt: new Date() };
          if (igComments) update.igComments = igComments;
          await db.doc(`contentItems/${itemDoc.id}`).update(update);
        }
      }

      // Account insights (Instagram)
      try {
        const account = await fetchAccountInsights(igId, igToken);
        const dateStr = new Date().toISOString().split('T')[0];
        await db.doc(`analytics/${uid}/daily/${dateStr}`).set({
          followerCount: account.followerCount,
          reach: account.reach,
          date: dateStr,
          fetchedAt: new Date(),
        });
      } catch { /* skip account insights errors */ }

      processed++;
    } catch (err) { console.error('[CRON] user error:', err); errors++; }
  }

  return NextResponse.json({ processed, errors });
}
