import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

/** GET /api/blog/stats — Stats blog depuis Firestore publicBlog */
export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('publicBlog')
      .orderBy('publishedAt', 'desc')
      .get();

    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        date: data.publishedAt?.toDate?.()?.toISOString() || null,
        url: `/blog/${doc.id}`,
        image: data.coverImage || null,
        views: 0,
        likes: 0,
        comments: 0,
      };
    });

    const totals = {
      views: 0,
      likes: 0,
      comments: 0,
      posts: posts.length,
    };

    return NextResponse.json({ posts, totals }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur stats blog' }, { status: 500 });
  }
}
