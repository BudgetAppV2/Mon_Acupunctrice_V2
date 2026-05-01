import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/** POST /api/cms/approve — Approuve un contenu (status → published + revalidate ISR) */
export async function POST(request: NextRequest) {
  const { id, type, uid } = await request.json() as { id: string; type: string; uid: string };
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  await db.collection(collection).doc(id).update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: uid || '',
  });

  // Revalidate ISR
  if (type === 'blog') {
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
  } else if (type === 'faq') {
    revalidatePath('/faq');
  } else if (type === 'ressource') {
    revalidatePath('/ressources');
    revalidatePath(`/ressources/${id}`);
  }

  return NextResponse.json({ success: true });
}
