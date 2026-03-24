import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { publishInstagram, publishInstagramStory, publishFacebook, publishYouTube } from '@/lib/utils/publishHelpers';

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
      const [userSnap, tokensSnap] = await Promise.all([
        db.doc(`users/${userId}`).get(),
        db.doc(`users/${userId}/private/tokens`).get(),
      ]);
      const user = userSnap.data() || {};
      const tokens = tokensSnap.data() || {};

      const igPostId = await publishInstagram(item);

      const updates: Record<string, unknown> = {
        distributionStatus: 'published',
        publishedAt: FieldValue.serverTimestamp(),
        instagramPostId: igPostId,
      };

      if (user.facebookPageId && tokens.facebookPageAccessToken) {
        try {
          const fbId = await publishFacebook(item, user.facebookPageId, tokens.facebookPageAccessToken);
          updates.facebookStatus = 'published';
          updates.facebookPostId = fbId;
        } catch { updates.facebookStatus = 'failed'; }
      }

      if (user.youtubeChannelId && tokens.youtubeRefreshToken) {
        try {
          const ytId = await publishYouTube(item, tokens.youtubeRefreshToken);
          updates.youtubeStatus = 'published';
          updates.youtubeVideoId = ytId;
        } catch (e) {
          updates.youtubeStatus = (e instanceof Error && e.message.includes('quota')) ? 'quota_exceeded' : 'failed';
        }
      }

      // Story IG (si item de type story)
      if (user.metaInstagramId && tokens.metaAccessToken && item.mediaType === 'story') {
        try {
          const storyId = await publishInstagramStory(item, user.metaInstagramId as string, tokens.metaAccessToken as string);
          updates.storyStatus = 'published';
          updates.storyMediaId = storyId;
        } catch { updates.storyStatus = 'failed'; }
      }

      await db.doc(`contentItems/${doc.id}`).update(updates);
      // Progression (S07)
      const wk = new Date().toISOString().slice(0, 4) + '-W' + String(Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000)).padStart(2, '0');
      await db.doc(`users/${userId}`).update({
        'progressData.totalPublished': FieldValue.increment(1),
        'progressData.lastActiveWeek': wk,
      }).catch(() => {});
      published++;
    } catch {
      await db.doc(`contentItems/${doc.id}`).update({ distributionStatus: 'failed' }).catch(() => {});
      failed++;
    }
  }

  // Auto-publish des stories de sequences (calendarSlots avec autoPublish=true)
  const autoSnap = await db.collection('calendarSlots')
    .where('autoPublish', '==', true)
    .where('status', '==', 'open')
    .where('scheduledDate', '<=', now)
    .limit(5)
    .get();

  for (const slotDoc of autoSnap.docs) {
    const slot = slotDoc.data();
    const slotUserId = slot.userId as string;
    try {
      const [uSnap, tSnap] = await Promise.all([
        db.doc(`users/${slotUserId}`).get(),
        db.doc(`users/${slotUserId}/private/tokens`).get(),
      ]);
      const u = uSnap.data() || {};
      const t = tSnap.data() || {};
      if (u.metaInstagramId && t.metaAccessToken) {
        await publishInstagramStory(slot, u.metaInstagramId, t.metaAccessToken);
      }
      await db.doc(`calendarSlots/${slotDoc.id}`).update({ status: 'completed', updatedAt: FieldValue.serverTimestamp() });
      published++;
    } catch {
      await db.doc(`calendarSlots/${slotDoc.id}`).update({ status: 'failed' }).catch(() => {});
      failed++;
    }
  }

  return NextResponse.json({ processed: snap.size + autoSnap.size, published, failed });
}
