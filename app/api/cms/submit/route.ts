import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/** POST /api/cms/submit — Soumet un contenu pour validation (status → pending) */
export async function POST(request: NextRequest) {
  const { id, type } = await request.json() as { id: string; type: string };
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  await db.collection(collection).doc(id).update({
    status: 'pending',
    submittedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    reviewComment: '',
  });

  return NextResponse.json({ success: true });
}
