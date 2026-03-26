import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const WIX_URL = process.env.NEXT_PUBLIC_WIX_URL || 'https://mon-acupunctrice.ca';

/** Refresh le access_token Google via le refresh_token */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken, client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('refresh_failed');
  return data.access_token;
}

/** POST /api/publish-youtube — Publie un YouTube Short via Resumable Upload */
export async function POST(request: NextRequest) {
  const { itemId, uid } = await request.json();
  if (!itemId || !uid) return NextResponse.json({ error: 'itemId et uid requis' }, { status: 400 });

  const db = getAdminFirestore();

  try {
    const [itemSnap, userSnap, tokensSnap] = await Promise.all([
      db.doc(`contentItems/${itemId}`).get(),
      db.doc(`users/${uid}`).get(),
      db.doc(`users/${uid}/private/tokens`).get(),
    ]);

    if (!itemSnap.exists) return NextResponse.json({ error: 'Item introuvable' }, { status: 404 });

    const item = itemSnap.data()!;
    const tokens = tokensSnap.data();
    const refreshToken = tokens?.youtubeRefreshToken;
    if (!refreshToken) return NextResponse.json({ error: 'YouTube non connecte' }, { status: 400 });

    const videoUrl = item.videoUrl;
    // Utiliser la caption YouTube dediee si disponible
    const ytCaption = item.captions?.youtube || item.caption || item.title || '';
    if (!videoUrl) return NextResponse.json({ error: 'Pas de video' }, { status: 400 });

    // 1. Refresh access token
    const accessToken = await refreshAccessToken(refreshToken);

    // 2. Telecharger la video
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error('video_download_failed');
    const videoBlob = await videoRes.arrayBuffer();

    // 3. Description YouTube — la caption YT inclut deja le lien si generee par l'IA
    const description = ytCaption.includes(WIX_URL) ? ytCaption : `${ytCaption}\n\nPrendre rendez-vous : ${WIX_URL}`;

    // 4. Initier le resumable upload
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': String(videoBlob.byteLength),
        },
        body: JSON.stringify({
          snippet: { title: item.title || 'Short', description, tags: ['Shorts', 'Acupuncture', 'Santé'], categoryId: '26' },
          status: { privacyStatus: 'public', selfDeclaredMadeForKids: false },
        }),
      },
    );

    if (initRes.status === 403) {
      await db.doc(`contentItems/${itemId}`).update({ youtubeStatus: 'quota_exceeded' });
      return NextResponse.json({ error: 'Quota YouTube depasse' }, { status: 429 });
    }
    if (!initRes.ok) throw new Error(`init_upload_failed: ${initRes.status}`);

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) throw new Error('no_upload_url');

    // 5. Upload la vidéo
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(videoBlob.byteLength) },
      body: videoBlob,
    });
    if (!uploadRes.ok) throw new Error(`upload_failed: ${uploadRes.status}`);

    const uploadData = await uploadRes.json();
    const videoId = uploadData.id;

    // 6. Update Firestore
    await db.doc(`contentItems/${itemId}`).update({
      youtubeStatus: 'published',
      youtubeVideoId: videoId,
    });

    return NextResponse.json({ success: true, videoId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur publication YouTube';
    await db.doc(`contentItems/${itemId}`).update({ youtubeStatus: 'failed' }).catch(() => {});
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
