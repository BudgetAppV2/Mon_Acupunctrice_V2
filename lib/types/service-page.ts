import type { Timestamp } from 'firebase/firestore';
import type { PublicationStatus } from './faq';

export type ServiceSlug = 'fertilite' | 'grossesse' | 'pediatrie' | 'acupuncture-sociale';

export interface ServicePage {
  id: string;
  slug: ServiceSlug;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  content: string; // markdown — contenu court du hub (extrait de la ressource correspondante)
  status: PublicationStatus;
  updatedAt: Timestamp;
}
