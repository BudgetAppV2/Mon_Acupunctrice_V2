import { getAdminFirestore } from '@/lib/firebase-admin';
import type { PublicBlogPost } from '@/lib/types/public-blog';

/**
 * Recupere les N derniers articles publics publies, tries par date decroissante.
 * Utilise cote Server Component uniquement (firebase-admin).
 *
 * @param limit Nombre maximum d'articles a retourner (defaut : 6)
 * @returns Array d'articles avec tous les champs PublicBlogPost
 */
export async function getRecentBlogPosts(limit = 6): Promise<PublicBlogPost[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('publicBlog')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    slug: doc.id,
    ...(doc.data() as Omit<PublicBlogPost, 'id' | 'slug'>),
  }));
}
