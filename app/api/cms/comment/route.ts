import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/** POST /api/cms/comment — Ajoute un commentaire de review */
export async function POST(request: NextRequest) {
  const { id, type, comment, uid } = await request.json() as {
    id: string; type: string; comment: string; uid: string;
  };
  if (!id || !type || !comment) return NextResponse.json({ error: 'id, type et comment requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  await db.collection(collection).doc(id).update({
    reviewComment: comment,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: uid || '',
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
