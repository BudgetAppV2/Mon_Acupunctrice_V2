import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

/** GET /api/cms/list — Liste unifiee blog + FAQ + ressources avec filtres */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get('type'); // blog | faq | ressource
  const statusFilter = searchParams.get('status'); // draft | pending | published

  const db = getAdminFirestore();
  const items: Record<string, unknown>[] = [];

  const collections = typeFilter
    ? [{ name: typeFilter === 'blog' ? 'publicBlog' : typeFilter === 'faq' ? 'faqs' : 'ressources', type: typeFilter }]
    : [
        { name: 'publicBlog', type: 'blog' },
        { name: 'faqs', type: 'faq' },
        { name: 'ressources', type: 'ressource' },
      ];

  await Promise.all(
    collections.map(async ({ name, type }) => {
      let query = db.collection(name).orderBy('updatedAt', 'desc').limit(100);
      if (statusFilter) {
        query = db.collection(name).where('status', '==', statusFilter).orderBy('updatedAt', 'desc').limit(100);
      }
      const snap = await query.get();
      snap.docs.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          type,
          title: d.title || d.question || '',
          status: d.status || 'draft',
          excerpt: d.excerpt || d.reponse?.slice(0, 120) || d.shortAnswer?.slice(0, 120) || '',
          updatedAt: d.updatedAt?.toDate?.()?.toISOString() || null,
          reviewComment: d.reviewComment || null,
        });
      });
    }),
  );

  // Sort by updatedAt desc across all types
  items.sort((a, b) => {
    const da = a.updatedAt as string || '';
    const db2 = b.updatedAt as string || '';
    return db2.localeCompare(da);
  });

  return NextResponse.json({ items });
}
