import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;
const GRAPH = 'https://graph.facebook.com/v25.0';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const WIX_URL = process.env.NEXT_PUBLIC_WIX_URL || 'https://mon-acupunctrice.ca';

// --- Helpers publication ---

async function publishInstagram(item: Record<string, unknown>): Promise<string | null> {
  if (!FUNCTIONS_URL) throw new Error('FIREBASE_FUNCTIONS_URL missing');
  const res = await fetch(`${FUNCTIONS_URL}/publishToInstagram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        videoUrl: item.videoUrl, caption: item.caption || '',
        itemId: item._id, coverOption: item.coverOption,
        thumbOffset: item.thumbOffset, coverUrl: item.coverImageUrl,
      },
    }),
  });
  if (!res.ok) throw new Error(`instagram_failed: ${res.status}`);
  const data = await res.json();
  return (data.result?.mediaId || data.mediaId) ?? null;
}

async function publishFacebook(
  item: Record<string, unknown>, pageId: string, pageToken: string,
): Promise<string | null> {
  const initRes = await fetch(`${GRAPH}/${pageId}/video_reels`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_phase: 'start', access_token: pageToken }),
  });
  const initData = await initRes.json();
  if (!initData.video_id) throw new Error('fb_init_failed');

  const uploadRes = await fetch(initData.upload_url, {
    method: 'POST', headers: { Authorization: `OAuth ${pageToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_url: item.videoUrl }),
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.success) throw new Error('fb_upload_failed');

  const pubRes = await fetch(`${GRAPH}/${pageId}/video_reels`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_phase: 'finish', video_id: initData.video_id, description: item.caption || '', access_token: pageToken }),
  });
  const pubData = await pubRes.json();
  if (!pubData.success) throw new Error('fb_publish_failed');
  return pubData.post_id || initData.video_id;
}

async function publishYouTube(
  item: Record<string, unknown>, refreshToken: string,
): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error('google_creds_missing');
  // Refresh token
  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token' }),
  });
  const tokData = await tokRes.json();
  if (!tokData.access_token) throw new Error('yt_refresh_failed');

  // Download video
  const vidRes = await fetch(item.videoUrl as string);
  if (!vidRes.ok) throw new Error('yt_video_download_failed');
  const vidBuf = await vidRes.arrayBuffer();

  const caption = (item.caption || item.title || '') as string;
  const desc = `${caption}\n\n#Shorts #Acupuncture #SanteNaturelle\n\nPrendre rendez-vous : ${WIX_URL}`;

  // Init resumable upload
  const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokData.access_token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4', 'X-Upload-Content-Length': String(vidBuf.byteLength) },
    body: JSON.stringify({ snippet: { title: (item.title || 'Short') as string, description: desc, tags: ['Shorts', 'Acupuncture'], categoryId: '26' }, status: { privacyStatus: 'public', selfDeclaredMadeForKids: false } }),
  });
  if (initRes.status === 403) throw new Error('yt_quota_exceeded');
  if (!initRes.ok) throw new Error(`yt_init_failed: ${initRes.status}`);
  const uploadUrl = initRes.headers.get('Location');
  if (!uploadUrl) throw new Error('yt_no_upload_url');

  const upRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(vidBuf.byteLength) }, body: vidBuf });
  if (!upRes.ok) throw new Error(`yt_upload_failed: ${upRes.status}`);
  const upData = await upRes.json();
  return upData.id ?? null;
}

// --- Cron handler ---

/** GET /api/cron/publish — Publie les items planifiés dont scheduledAt <= maintenant */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminFirestore();
  const now = new Date();

  const snap = await db.collection('contentItems')
    .where('distributionStatus', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .limit(10)
    .get();

  if (snap.empty) return NextResponse.json({ processed: 0, published: 0, failed: 0 });

  let published = 0, failed = 0;

  for (const doc of snap.docs) {
    const item = { _id: doc.id, ...doc.data() } as Record<string, unknown>;
    const userId = item.userId as string;
    if (!userId || !item.videoUrl) { failed++; continue; }

    await db.doc(`contentItems/${doc.id}`).update({ distributionStatus: 'publishing' });

    try {
      // Lire user + tokens
      const [userSnap, tokensSnap] = await Promise.all([
        db.doc(`users/${userId}`).get(),
        db.doc(`users/${userId}/private/tokens`).get(),
      ]);
      const user = userSnap.data() || {};
      const tokens = tokensSnap.data() || {};

      // Instagram (toujours)
      const igPostId = await publishInstagram(item);

      const updates: Record<string, unknown> = {
        distributionStatus: 'published',
        publishedAt: FieldValue.serverTimestamp(),
        instagramPostId: igPostId,
      };

      // Facebook (si connecté)
      if (user.facebookPageId && tokens.facebookPageAccessToken) {
        try {
          const fbId = await publishFacebook(item, user.facebookPageId, tokens.facebookPageAccessToken);
          updates.facebookStatus = 'published';
          updates.facebookPostId = fbId;
        } catch { updates.facebookStatus = 'failed'; }
      }

      // YouTube (si connecté)
      if (user.youtubeChannelId && tokens.youtubeRefreshToken) {
        try {
          const ytId = await publishYouTube(item, tokens.youtubeRefreshToken);
          updates.youtubeStatus = 'published';
          updates.youtubeVideoId = ytId;
        } catch (e) {
          updates.youtubeStatus = (e instanceof Error && e.message.includes('quota')) ? 'quota_exceeded' : 'failed';
        }
      }

      await db.doc(`contentItems/${doc.id}`).update(updates);
      published++;
    } catch {
      await db.doc(`contentItems/${doc.id}`).update({ distributionStatus: 'failed' }).catch(() => {});
      failed++;
    }
  }

  // --- Stories auto (CalendarSlots autoPublish=true) ---

  const autoSlots = await db.collection('calendarSlots')
    .where('autoPublish', '==', true)
    .where('status', '==', 'open')
    .where('scheduledDate', '<=', now)
    .limit(5)
    .get();

  let storiesPublished = 0;
  let storiesFailed = 0;

  for (const slotDoc of autoSlots.docs) {
    const slot = slotDoc.data();
    const userId = slot.userId as string;
    const imageUrl = slot.storyImageUrl as string | undefined;
    if (!userId || !imageUrl) { storiesFailed++; continue; }

    try {
      const tokensSnap = await db.doc(`users/${userId}/private/tokens`).get();
      const tokens = tokensSnap.data() || {};
      const igUserId = tokens.instagramUserId as string | undefined;
      const igToken = tokens.instagramAccessToken as string | undefined;
      if (!igUserId || !igToken) { storiesFailed++; continue; }

      // Créer le container story IG
      const containerRes = await fetch(
        `https://graph.facebook.com/v25.0/${igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: imageUrl, media_type: 'IMAGE', is_stories: true, access_token: igToken }),
        },
      );
      const containerData = await containerRes.json() as { id?: string };
      if (!containerData.id) { storiesFailed++; continue; }

      // Publier
      const pubRes = await fetch(
        `https://graph.facebook.com/v25.0/${igUserId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: containerData.id, access_token: igToken }),
        },
      );
      const pubData = await pubRes.json() as { id?: string };
      if (!pubData.id) { storiesFailed++; continue; }

      await db.doc(`calendarSlots/${slotDoc.id}`).update({
        status: 'completed',
        updatedAt: FieldValue.serverTimestamp(),
      });
      storiesPublished++;
    } catch {
      storiesFailed++;
    }
  }

  return NextResponse.json({
    processed: snap.size,
    published,
    failed,
    storiesProcessed: autoSlots.size,
    storiesPublished,
    storiesFailed,
  });
}
