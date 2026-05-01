import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/**
 * POST /api/cms/unpublish — Retire un contenu du site public.
 * status passe a 'pending' pour qu'il soit re-approuvable en 1 clic depuis la liste.
 * publishedAt est preserve (tracabilite historique).
 */
export async function POST(request: NextRequest) {
  const { id, type, uid } = await request.json() as { id: string; type: string; uid: string };
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  await db.collection(collection).doc(id).update({
    status: 'pending',
    updatedAt: FieldValue.serverTimestamp(),
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: uid || '',
    reviewComment: '',
  });

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
