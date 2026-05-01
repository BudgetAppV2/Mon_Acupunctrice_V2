import type { Timestamp } from 'firebase/firestore';

/**
 * Configuration globale du site public.
 *
 * ATTENTION : cette collection est en lecture publique sans authentification
 * (firestore.rules : `allow read: if true`). Ne JAMAIS y stocker de données
 * sensibles : pas de tokens, pas d'UIDs, pas d'emails privés, pas de clés API.
 * Uniquement des données non sensibles : NAP, liens sociaux, textes de footer,
 * timestamps de dernière exécution des crons.
 */
export interface SiteConfig {
  id: string; // 'general', 'nap', 'social', 'testimonials', 'contentRefresh'
  data: Record<string, unknown>;
  updatedAt: Timestamp;
}
