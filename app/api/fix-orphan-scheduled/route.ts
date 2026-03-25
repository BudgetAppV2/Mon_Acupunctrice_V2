import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

/** GET /api/fix-orphan-scheduled — One-shot fix pour les items scheduled sans slot */
export async function GET() {
  const db = getAdminFirestore();
  const snap = await db.collection('contentItems')
    .where('distributionStatus', '==', 'scheduled')
    .get();

  const fixed: string[] = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.slotId || !data.scheduledAt) {
      await db.doc(`contentItems/${doc.id}`).update({
        distributionStatus: 'draft',
        workflowState: data.videoUrl ? 'ready' : 'idea',
      });
      fixed.push(`${doc.id}: ${data.title}`);
    }
  }

  return NextResponse.json({ total: snap.size, fixed });
}
