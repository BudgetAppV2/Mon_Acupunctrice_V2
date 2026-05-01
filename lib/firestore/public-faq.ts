import { getAdminFirestore } from '@/lib/firebase-admin';
import type { FAQ } from '@/lib/types/faq';

const COLLECTION = 'faqs';

/**
 * Recupere toutes les FAQ publiees, triees par ordre (champ `order`).
 * Utilise cote Server Component uniquement (firebase-admin).
 *
 * Note : tri JS plutot que Firestore orderBy pour eviter un index composite
 * (meme pattern que MW-D2 publicBlog). Avec 6 docs, le cout CPU est negligeable.
 */
export async function getAllPublishedFaqs(): Promise<FAQ[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COLLECTION)
    .where('status', '==', 'published')
    .get();
  return snap.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<FAQ, 'id'>),
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
