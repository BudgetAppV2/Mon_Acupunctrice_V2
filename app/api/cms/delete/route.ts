import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/lib/firebase-admin';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/**
 * POST /api/cms/delete — Supprime DEFINITIVEMENT un contenu (hard delete Firestore).
 *
 * Restriction : autorise uniquement si status === 'pending'.
 * Pour un contenu published, depublier d'abord (/api/cms/unpublish), puis supprimer.
 *
 * IRREVERSIBLE : aucune restauration possible apres delete.
 */
export async function POST(request: NextRequest) {
  const { id, type } = await request.json() as { id: string; type: string; uid?: string };
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  const docRef = db.collection(collection).doc(id);
  const snap = await docRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
  }

  const data = snap.data();
  if (data?.status !== 'pending') {
    return NextResponse.json({
      error: 'Suppression autorisee uniquement pour les contenus en attente. Depublier d\'abord.',
      currentStatus: data?.status,
    }, { status: 400 });
  }

  await docRef.delete();

  if (type === 'blog') {
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
  } else if (type === 'faq') {
    revalidatePath('/faq');
  } else if (type === 'ressource') {
    revalidatePath('/ressources');
    revalidatePath(`/ressources/${id}`);
  }

  return NextResponse.json({ success: true, deleted: { id, type } });
}
