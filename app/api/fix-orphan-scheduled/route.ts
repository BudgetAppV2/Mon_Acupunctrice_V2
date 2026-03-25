import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/** GET /api/fix-orphan-scheduled — Fix items avec state incohérent */
export async function GET() {
  const db = getAdminFirestore();

  // 1. Items scheduled sans slot
  const scheduledSnap = await db.collection('contentItems')
    .where('distributionStatus', '==', 'scheduled')
    .get();

  const fixed: string[] = [];
  for (const doc of scheduledSnap.docs) {
    const data = doc.data();
    if (!data.slotId) {
      await db.doc(`contentItems/${doc.id}`).update({
        distributionStatus: 'draft',
        workflowState: data.videoUrl ? 'ready' : 'idea',
        scheduledAt: FieldValue.delete(),
        slotId: FieldValue.delete(),
      });
      fixed.push(`scheduled-orphan: ${doc.id} (${data.title})`);
    }
  }

  // 2. Items draft qui ont encore un scheduledAt (cause du bug deriveWorkflowState)
  const allSnap = await db.collection('contentItems').get();
  for (const doc of allSnap.docs) {
    const data = doc.data();
    if (data.distributionStatus === 'draft' && data.scheduledAt) {
      await db.doc(`contentItems/${doc.id}`).update({
        scheduledAt: FieldValue.delete(),
        workflowState: data.videoUrl ? 'ready' : 'idea',
      });
      fixed.push(`stale-scheduledAt: ${doc.id} (${data.title})`);
    }
    // Items avec slotId mais pas scheduled
    if (data.distributionStatus === 'draft' && data.slotId) {
      await db.doc(`contentItems/${doc.id}`).update({
        slotId: FieldValue.delete(),
      });
      fixed.push(`stale-slotId: ${doc.id} (${data.title})`);
    }
  }

  return NextResponse.json({ total: allSnap.size, fixed });
}
