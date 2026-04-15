import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminFirestore } from '@/lib/firebase-admin';
import SectionHeading from '../_components/SectionHeading';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    "Articles sur l'acupuncture : fertilite, grossesse, pediatrie, acupuncture sociale. Par Judith Dufour-Savard, acupunctrice a Montreal.",
};

export const revalidate = 3600;

function formatDate(publishedAt: { toDate?: () => Date; _seconds?: number } | null): string {
  if (!publishedAt) return '';
  const date = publishedAt.toDate
    ? publishedAt.toDate()
    : publishedAt._seconds
      ? new Date(publishedAt._seconds * 1000)
      : null;
  if (!date) return '';
  return date.toLocaleDateString('fr-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogListPage() {
  const db = getAdminFirestore();
  // Query sans orderBy pour eviter la dependance a un index composite
  // (qui peut prendre du temps a se construire). Tri en code — acceptable
  // pour 11 documents. L'index composite reste dans firestore.indexes.json
  // pour quand le volume augmentera.
  const snapshot = await db
    .collection('publicBlog')
    .where('status', '==', 'published')
    .get();

  const posts = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }) as {
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      coverImage: string;
      author: string;
      category: string;
      publishedAt: { toDate?: () => Date; _seconds?: number; seconds?: number } | null;
    })
    .sort((a, b) => {
      const aTime = a.publishedAt?.toDate?.()?.getTime()
        ?? (a.publishedAt?._seconds ?? a.publishedAt?.seconds ?? 0) * 1000;
      const bTime = b.publishedAt?.toDate?.()?.getTime()
        ?? (b.publishedAt?._seconds ?? b.publishedAt?.seconds ?? 0) * 1000;
      return bTime - aTime;
    });

  return (
    <main className="mx-auto max-w-[1280px] px-5 md:px-8 py-16 md:py-24">
      <SectionHeading
        kicker="BLOG"
        title="Articles"
        subtitle="Fertilite, grossesse, pediatrie, acupuncture sociale — par Judith Dufour-Savard, acupunctrice a Montreal."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group border border-public-border-subtle rounded-[14px] overflow-hidden hover:shadow-public-md transition-shadow"
          >
            {post.coverImage && (
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-6">
              {post.category && (
                <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-public-accent-taupe-dark">
                  {post.category}
                </span>
              )}
              <h2 className="font-public-serif text-xl font-semibold text-public-text-dark leading-tight mt-2 mb-2">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-[15px] text-public-text-medium leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
              )}
              <p className="text-[13px] text-public-text-light">
                {post.author} — {formatDate(post.publishedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
