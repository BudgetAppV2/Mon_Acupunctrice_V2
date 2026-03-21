import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

const GRAPH = 'https://graph.facebook.com/v25.0';

/** POST /api/publish-facebook — Publie un Reel sur la Page Facebook */
export async function POST(request: NextRequest) {
  const { itemId, uid } = await request.json();
  if (!itemId || !uid) {
    return NextResponse.json({ error: 'itemId et uid requis' }, { status: 400 });
  }

  const db = getAdminFirestore();

  try {
    // Lire les données nécessaires
    const [itemSnap, userSnap, tokensSnap] = await Promise.all([
      db.doc(`contentItems/${itemId}`).get(),
      db.doc(`users/${uid}`).get(),
      db.doc(`users/${uid}/private/tokens`).get(),
    ]);

    if (!itemSnap.exists) return NextResponse.json({ error: 'Item introuvable' }, { status: 404 });

    const item = itemSnap.data()!;
    const user = userSnap.data();
    const tokens = tokensSnap.data();

    const videoUrl = item.videoUrl;
    const caption = item.caption || '';
    const pageId = user?.facebookPageId;
    const pageToken = tokens?.facebookPageAccessToken;

    if (!videoUrl) return NextResponse.json({ error: 'Pas de video' }, { status: 400 });
    if (!pageId || !pageToken) return NextResponse.json({ error: 'Facebook non connecte' }, { status: 400 });

    // Étape 1 : Init upload
    const initRes = await fetch(`${GRAPH}/${pageId}/video_reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upload_phase: 'start', access_token: pageToken }),
    });
    const initData = await initRes.json();
    if (!initData.video_id) throw new Error(`init_failed: ${JSON.stringify(initData)}`);

    // Étape 2 : Upload vidéo via file_url
    const uploadRes = await fetch(initData.upload_url, {
      method: 'POST',
      headers: { Authorization: `OAuth ${pageToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_url: videoUrl }),
    });
    const uploadData = await uploadRes.json();
    if (!uploadData.success) throw new Error(`upload_failed: ${JSON.stringify(uploadData)}`);

    // Étape 3 : Publish
    const publishRes = await fetch(`${GRAPH}/${pageId}/video_reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'finish',
        video_id: initData.video_id,
        description: caption,
        access_token: pageToken,
      }),
    });
    const publishData = await publishRes.json();
    if (!publishData.success) throw new Error(`publish_failed: ${JSON.stringify(publishData)}`);

    // Mettre à jour le contentItem
    await db.doc(`contentItems/${itemId}`).update({
      facebookStatus: 'published',
      facebookPostId: publishData.post_id || initData.video_id,
    });

    return NextResponse.json({ success: true, postId: publishData.post_id || initData.video_id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur publication Facebook';
    // Marquer comme failed
    await db.doc(`contentItems/${itemId}`).update({ facebookStatus: 'failed' }).catch(() => {});
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
