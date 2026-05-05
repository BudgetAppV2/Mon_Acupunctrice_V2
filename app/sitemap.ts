import type { MetadataRoute } from 'next';
import { getAdminFirestore } from '@/lib/firebase-admin';

const BASE_URL = 'https://acupuncturejudith.ca';
const STATIC_DATE = new Date('2026-04-29');

export const revalidate = 3600;

function toDate(ts: { toDate?: () => Date; _seconds?: number } | undefined): Date {
  if (!ts) return STATIC_DATE;
  if (ts.toDate) return ts.toDate();
  if (ts._seconds) return new Date(ts._seconds * 1000);
  return STATIC_DATE;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getAdminFirestore();

  // Blog articles — date réelle depuis Firestore
  const blogSnap = await db
    .collection('publicBlog')
    .where('status', '==', 'published')
    .select('slug', 'publishedAt', 'updatedAt')
    .get();

  const blogUrls: MetadataRoute.Sitemap = blogSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      url: `${BASE_URL}/blog/${d.slug}`,
      lastModified: toDate(d.updatedAt ?? d.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    };
  });

  // Ressources SEO — date réelle depuis Firestore
  const ressourcesSnap = await db
    .collection('ressources')
    .where('status', '==', 'published')
    .select('slug', 'publishedAt', 'updatedAt')
    .get();

  const ressourcesUrls: MetadataRoute.Sitemap = ressourcesSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      url: `${BASE_URL}/ressources/${d.slug}`,
      lastModified: toDate(d.updatedAt ?? d.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    };
  });

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                           lastModified: STATIC_DATE, changeFrequency: 'weekly',   priority: 1.0 },
    { url: `${BASE_URL}/services`,                             lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.8 },
    { url: `${BASE_URL}/services/fertilite`,                   lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.9 },
    { url: `${BASE_URL}/services/grossesse`,                   lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.9 },
    { url: `${BASE_URL}/services/pediatrie`,                   lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.9 },
    { url: `${BASE_URL}/services/acupuncture-sociale`,         lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.9 },
    { url: `${BASE_URL}/ressources`,                           lastModified: STATIC_DATE, changeFrequency: 'weekly',   priority: 0.7 },
    { url: `${BASE_URL}/blog`,                                 lastModified: STATIC_DATE, changeFrequency: 'weekly',   priority: 0.7 },
    { url: `${BASE_URL}/a-propos`,                             lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.7 },
    { url: `${BASE_URL}/tarifs`,                               lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.8 },
    { url: `${BASE_URL}/reserver`,                             lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.8 },
    { url: `${BASE_URL}/contact`,                              lastModified: STATIC_DATE, changeFrequency: 'monthly',  priority: 0.7 },
    { url: `${BASE_URL}/faq`,                                  lastModified: STATIC_DATE, changeFrequency: 'weekly',   priority: 0.7 },
  ];

  return [...staticUrls, ...blogUrls, ...ressourcesUrls];
}
