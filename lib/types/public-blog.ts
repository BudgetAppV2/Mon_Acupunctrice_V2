import type { Timestamp } from 'firebase/firestore';
import type { PublicationStatus } from './faq';

export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown (converti depuis Ricos en MW-B4)
  excerpt: string;
  coverImage: string;
  author: string; // "Judith Dufour-Savard" ou "Judith Dufour-Savard et Claire Thomas"
  category: string;
  tags: string[];
  status: PublicationStatus;
  relatedServices: string[];
  relatedFaqs: string[];
  relatedArticles: string[];
  wixPostId?: string; // référence double publication (amendement A3)
  publishedAt: Timestamp | null;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  faqs?: { question: string; answer: string }[];
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
