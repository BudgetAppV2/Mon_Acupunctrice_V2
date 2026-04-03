import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

/** One-shot patch: add facebookVideoId to 2 existing publications */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminFirestore();
  const patches = [
    { id: 'X8Q6iX2hwX5XrQy010fw', facebookVideoId: '1607816233814781' },
    { id: 'bNWGTtqRcQ9XijoiRTX5', facebookVideoId: '904947642341863' },
  ];

  for (const p of patches) {
    await db.doc(`contentItems/${p.id}`).update({ facebookVideoId: p.facebookVideoId });
  }

  return NextResponse.json({ patched: patches.length });
}
