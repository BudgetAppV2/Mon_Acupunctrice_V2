import { getAdminFirestore } from '@/lib/firebase-admin';
import type { Ressource } from '@/lib/types/ressource';

const COLLECTION = 'ressources';

/**
 * Recupere toutes les ressources publiees (status === 'published').
 * Utilise cote Server Component uniquement (firebase-admin).
 */
export async function getAllPublishedRessources(): Promise<Ressource[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COLLECTION)
    .where('status', '==', 'published')
    .get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Ressource, 'id'>),
  }));
}

/**
 * Recupere une ressource par son slug (== doc id). Retourne null si non trouvee
 * ou non publiee.
 */
export async function getRessourceBySlug(slug: string): Promise<Ressource | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(slug).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  if (data.status !== 'published') return null;
  return { id: doc.id, ...(data as Omit<Ressource, 'id'>) };
}

/**
 * Retourne les ressources publiees autres que `currentSlug`, triees pour
 * placer en priorite celles du meme pilier. Limite par defaut : 3.
 */
export async function getRelatedRessources(
  currentSlug: string,
  pilier: string,
  limit = 3
): Promise<Ressource[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(COLLECTION)
    .where('status', '==', 'published')
    .get();
  return snap.docs
    .filter((doc) => doc.id !== currentSlug)
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Ressource, 'id'>) }))
    .sort((a, b) => {
      if (a.pilier === pilier && b.pilier !== pilier) return -1;
      if (a.pilier !== pilier && b.pilier === pilier) return 1;
      return 0;
    })
    .slice(0, limit);
}
