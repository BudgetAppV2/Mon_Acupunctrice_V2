import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminFirestore } from '@/lib/firebase-admin';
import AuthorByline from '../../_components/AuthorByline';
import MarkdownRenderer from '../../_components/MarkdownRenderer';
import CtaButton from '../../_components/CtaButton';

export const revalidate = 3600;

// SSG — pre-build all published articles
export async function generateStaticParams() {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection('publicBlog')
    .where('status', '==', 'published')
    .select('slug')
    .get();
  return snapshot.docs.map((doc) => ({ slug: doc.data().slug as string }));
}

// Dynamic metadata per article
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getAdminFirestore();
  const doc = await db.collection('publicBlog').doc(slug).get();
  if (!doc.exists) return { title: 'Article non trouve' };
  const post = doc.data()!;
  const publishedTime = post.publishedAt?.toDate?.()?.toISOString();
  return {
    title: post.title,
    description: post.excerpt?.slice(0, 160) || '',
    openGraph: {
      title: post.title,
      description: post.excerpt?.slice(0, 160) || '',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: 'article',
      ...(publishedTime ? { publishedTime } : {}),
    },
  };
}

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

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getAdminFirestore();
  const doc = await db.collection('publicBlog').doc(slug).get();

  if (!doc.exists) notFound();

  const post = doc.data()!;
  const dateStr = formatDate(post.publishedAt);
  const publishedIso = post.publishedAt?.toDate?.()?.toISOString();
  const updatedIso = post.updatedAt?.toDate?.()?.toISOString();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: {
      '@type': 'Person',
      name: 'Judith Dufour-Savard',
      jobTitle: 'Acupunctrice',
      memberOf: { '@type': 'Organization', name: 'Ordre des acupuncteurs du Québec' },
    },
    datePublished: publishedIso,
    dateModified: updatedIso ?? publishedIso,
    image: post.coverImage || undefined,
    publisher: { '@type': 'Person', name: 'Judith Dufour-Savard' },
    description: post.excerpt,
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.acupuncturejudith.ca' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.acupuncturejudith.ca/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.acupuncturejudith.ca/blog/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <article>
        {/* Cover image — priority for LCP */}
        {post.coverImage && (
          <div className="max-w-4xl mx-auto px-5 md:px-8 pt-8">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                priority
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Meta bloc */}
        <div className="max-w-3xl mx-auto px-5 md:px-8 mt-8 mb-10">
          {post.category && (
            <span className="text-[11px] font-semibold tracking-[1.5px] uppercase text-public-accent-taupe-dark">
              {post.category}
            </span>
          )}
          <h1 className="font-public-serif text-[34px] md:text-[46px] font-medium leading-[1.15] text-public-text-dark mt-3 mb-4">
            {post.title}
          </h1>
          <p className="text-[15px] text-public-text-light">
            Par {post.author} — {dateStr}
          </p>
        </div>

        {/* Markdown content */}
        <div className="max-w-3xl mx-auto px-5 md:px-8 pb-16">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Auteur */}
        <AuthorByline />

        {/* CTA + retour */}
        <div className="max-w-3xl mx-auto px-5 md:px-8 pb-16 flex flex-col items-center gap-6">
          <CtaButton variant="primary" size="lg">
            Reserver une seance
          </CtaButton>
          <Link
            href="/blog"
            className="text-public-accent-taupe-dark underline underline-offset-4 text-sm"
          >
            Retour aux articles
          </Link>
        </div>
      </article>
    </>
  );
}
