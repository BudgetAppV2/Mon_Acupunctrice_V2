import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const GRAPH_IG = 'https://graph.instagram.com/v25.0';
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 90_000;

/** POST /api/publish-instagram — Publie un Reel sur Instagram via tokens Firestore */
export async function POST(request: NextRequest) {
  const { itemId, uid } = await request.json();
  if (!itemId || !uid) {
    return NextResponse.json({ error: 'itemId et uid requis' }, { status: 400 });
  }

  const db = getAdminFirestore();

  try {
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
    const caption = item.captions?.instagram || item.caption || '';
    const igAccountId = user?.metaInstagramId;
    const accessToken = tokens?.metaAccessToken;

    if (!videoUrl) return NextResponse.json({ error: 'Pas de video' }, { status: 400 });
    if (!igAccountId || !accessToken) {
      return NextResponse.json({ error: 'Instagram non connecte. Reconnecte dans Profil.' }, { status: 400 });
    }

    console.log('[IG] Starting publish for', itemId, 'igId:', igAccountId);

    // Étape 1 : Créer le container Reel
    const createParams = new URLSearchParams({
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      access_token: accessToken,
    });
    // Ajouter la cover si spécifiée
    if (item.coverOption === 'custom' && item.coverImageUrl) {
      createParams.set('cover_url', item.coverImageUrl);
    } else if (item.thumbOffset !== undefined && item.thumbOffset !== null) {
      createParams.set('thumb_offset', String(Math.round(item.thumbOffset)));
    }

    const createRes = await fetch(`${GRAPH_IG}/${igAccountId}/media`, {
      method: 'POST',
      body: createParams,
    });
    const createData = await createRes.json();
    console.log('[IG] Container created:', JSON.stringify(createData).substring(0, 200));
    if (!createData.id) {
      throw new Error(`container_failed: ${JSON.stringify(createData)}`);
    }

    // Étape 2 : Poll le status du container
    const containerId = createData.id;
    const start = Date.now();
    while (Date.now() - start < POLL_TIMEOUT_MS) {
      const statusRes = await fetch(
        `${GRAPH_IG}/${containerId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();

      if (statusData.status_code === 'FINISHED') break;
      if (statusData.status_code === 'ERROR') {
        throw new Error(`instagram_processing_error: video rejected by Instagram`);
      }
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    }

    // Étape 3 : Publier le container
    const publishParams = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });
    const publishRes = await fetch(`${GRAPH_IG}/${igAccountId}/media_publish`, {
      method: 'POST',
      body: publishParams,
    });
    const publishData = await publishRes.json();
    console.log('[IG] Publish result:', JSON.stringify(publishData).substring(0, 200));
    if (!publishData.id) {
      throw new Error(`publish_failed: ${JSON.stringify(publishData)}`);
    }

    // Étape 4 : Update Firestore
    await db.doc(`contentItems/${itemId}`).update({
      distributionStatus: 'published',
      instagramPostId: publishData.id,
      publishedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, mediaId: publishData.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur publication Instagram';
    console.error('[IG] FAILED:', msg);
    await db.doc(`contentItems/${itemId}`).update({ distributionStatus: 'failed' }).catch(() => {});
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
