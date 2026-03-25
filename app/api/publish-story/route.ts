import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { publishInstagramStory } from '@/lib/utils/publishHelpers';

/** POST /api/publish-story — Publie une Story Instagram via l'API Graph Meta */
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

    const igUserId = user?.metaInstagramId;
    const accessToken = tokens?.metaAccessToken;

    console.log('[STORY] igUserId:', igUserId, 'hasToken:', !!accessToken);
    if (!item.videoUrl && !item.coverImageUrl) {
      return NextResponse.json({ error: 'Pas de media (video ou image requise)' }, { status: 400 });
    }
    if (!igUserId || !accessToken) {
      return NextResponse.json({ error: 'Instagram non connecte' }, { status: 400 });
    }

    const storyId = await publishInstagramStory(
      item as Record<string, unknown>,
      igUserId as string,
      accessToken as string,
    );

    await db.doc(`contentItems/${itemId}`).update({
      storyStatus: 'published',
      storyMediaId: storyId,
    });

    return NextResponse.json({ success: true, storyId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur publication Story';
    await db.doc(`contentItems/${itemId}`).update({ storyStatus: 'failed' }).catch(() => {});
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
