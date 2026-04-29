import type { Timestamp } from 'firebase/firestore';

export type FaqCategory =
  | 'fertilite'
  | 'grossesse'
  | 'pediatrie'
  | 'acupuncture-sociale'
  | 'seance';

export type PublicationStatus = 'draft' | 'pending' | 'published' | 'rejected';

export type CtaVariant = 'reserver' | 'contact' | 'tarifs';

export interface FAQ {
  id: string;
  question: string;
  reponse: string; // markdown
  category: FaqCategory;
  order: number;
  status: PublicationStatus;
  ctaVariant: CtaVariant;
  relatedServices: string[]; // slugs : 'fertilite', 'grossesse', etc.
  relatedArticles: string[]; // slugs d'articles publicBlog
  relatedFaqs: string[]; // IDs d'autres documents faqs
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
