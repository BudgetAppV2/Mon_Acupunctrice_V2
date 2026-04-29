import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

/** GET /api/blog/list — Liste les articles depuis Firestore publicBlog */
export async function GET() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('publicBlog')
      .orderBy('publishedAt', 'desc')
      .limit(50)
      .get();

    const posts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        published: data.status === 'published',
        hasUnpublishedChanges: false,
        firstPublishedDate: data.publishedAt?.toDate?.()?.toISOString() || null,
        url: `/blog/${doc.id}`,
        coverImage: data.coverImage || null,
      };
    });

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: 'Erreur listing blog' }, { status: 500 });
  }
}
