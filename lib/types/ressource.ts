import type { Timestamp } from 'firebase/firestore';
import type { PublicationStatus } from './faq';

export type RessourcePilier =
  | 'fertilite'
  | 'grossesse'
  | 'pediatrie'
  | 'acupuncture-sociale'
  | 'transversal';

export type RessourceType = 'guide' | 'checklist' | 'article-fond' | 'infographie';

export interface Citation {
  authors: string;
  title: string;
  journal: string;
  year: number;
  url?: string; // lien PubMed ou DOI
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface Ressource {
  id: string;
  title: string;
  slug: string;
  type: RessourceType;
  pilier: RessourcePilier;
  status: PublicationStatus;

  // Champs meta SEO
  metaTitle: string;
  metaDescription: string;
  heroImageUrl?: string; // URL Firebase Storage, optionnel au lancement
  heroImageAlt: string; // obligatoire pour SEO/accessibilité

  // Sections riches (markdown) — structure alignée sur source-resources/*.md
  shortAnswer: string;
  introSection: string;
  scienceSection: string;
  mechanismSection: string;
  judithApproach: string;
  whatToExpect: string;
  protocolSection: string;
  testimonial: string;

  // FAQ embarquée pour schema.org FAQPage par ressource
  faqEntries: FaqEntry[];

  // Citations scientifiques (amendement A1)
  citations: Citation[];

  // Relations (maillage MW-D6)
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  relatedResources: string[]; // slugs d'autres ressources

  // Meta
  authorName: string;
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;

  // Champs review (MW-E4)
  reviewComment?: string;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  submittedAt?: Timestamp;
  // Champs rejet (Q11)
  rejectionReason?: string;
  rejectedAt?: Timestamp;
  rejectedBy?: string;
}
